import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { fromSchemaLieuDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { filter, findLieuById, scanAll, attributeNotExists } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage, markAsDeduplicated, toISOStringDateMaj, upsertLieu } from '../../../storage';
import { MergeGroupTransfer } from '../../../transfers';

/**
 * @openapi
 * /lieux-inclusion-numerique/merge-groups:
 *   patch:
 *     summary: Mettre à jour les identifiants de groupes de fusion pour les lieux dupliqués.
 *     description: Cette opération permet d'associer des identifiants de groupes de fusion aux lieux pour lesquels des doublons ont étés détectés. Les fusions provoquent la création de nouveaux lieux agrégeant les informations les plus à jour des lieux fusionnés.
 *     operationId: lieux-inclusion-numerique-merge-groups.patch
 *     security:
 *       - ApiKeyAuthorization: []
 *     requestBody:
 *       description: Les groupes de fusion associés aux identifiants des lieux concernés par la fusion et au lieu résultant de la fusion.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/MergeGroup'
 *     responses:
 *       422:
 *         description: Le format des données fournies dans le body doit correspondre à un ensemble de groupes de fusion valide.
 *       200:
 *         description: Les groupes de fusion et la création des lieux fusionnés ont étés traités avec succès.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const mergeGroups: MergeGroupTransfer[] = JSON.parse(event.body ?? '[]');
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    await Promise.all(
      mergeGroups.map(async (mergeGroup: MergeGroupTransfer): Promise<void> => {
        await Promise.all(
          mergeGroup.mergedIds.map(
            async (mergedLieuId: string): Promise<PutCommandOutput> =>
              await docClient.send(
                new PutCommand({
                  TableName: 'cartographie-nationale.lieux-inclusion-numerique',
                  Item: { ...(await findLieuById(docClient)(mergedLieuId)), group: mergeGroup.groupId }
                })
              )
          )
        );

        await upsertLieu(docClient)({
          ...toISOStringDateMaj(fromSchemaLieuDeMediationNumerique(mergeGroup.lieu)),
          mergedIds: mergeGroup.mergedIds,
          group: mergeGroup.groupId
        });
      })
    );

    const lieuxToMarkAsMerged: LieuInclusionNumeriqueStorage[] = await scanAll<LieuInclusionNumeriqueStorage>(
      'cartographie-nationale.lieux-inclusion-numerique',
      filter<LieuInclusionNumeriqueStorage>(attributeNotExists('deduplicated'))
    );

    await Promise.all(
      lieuxToMarkAsMerged.map(
        async (lieu: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> => markAsDeduplicated(docClient)(lieu)
      )
    );

    return successResponse({
      message: 'Les groupes de fusion et la création des lieux fusionnés ont étés traités avec succès.'
    });
  } catch {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Le format des données fournies dans le body doit correspondre à un ensemble de groupes de fusion valide.'
      })
    };
  }
};
