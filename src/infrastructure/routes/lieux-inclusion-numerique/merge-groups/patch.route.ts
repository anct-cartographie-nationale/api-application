import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommandOutput, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { fromSchemaLieuDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { attribute, attributeExists, equals, filter, or, scanAll } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import { MergedLieuInclusionNumeriqueStorage, toISOStringDateMaj, upsertLieu } from '../../../storage';
import { MergeGroupsUpdateTransfer, MergeGroupTransfer } from '../../../transfers';

const TABLE_NAME = 'cartographie-nationale.lieux-inclusion-numerique' as const;

const saveMergedLieuFrom =
  (docClient: DynamoDBDocumentClient) =>
  async (mergeGroup: MergeGroupTransfer): Promise<PutCommandOutput> =>
    await upsertLieu(docClient)({
      ...toISOStringDateMaj(fromSchemaLieuDeMediationNumerique(mergeGroup.lieu)),
      mergedIds: mergeGroup.mergedIds,
      group: mergeGroup.groupId
    });

const addMergeGroupForAllLieuxIn =
  (docClient: DynamoDBDocumentClient) =>
  async ({ groupId, mergedIds }: MergeGroupTransfer): Promise<void> => {
    for (const id of mergedIds) {
      await docClient.send(
        new UpdateCommand({
          Key: { id },
          TableName: TABLE_NAME,
          ExpressionAttributeNames: { '#group': 'group' },
          ExpressionAttributeValues: { ':group': groupId },
          UpdateExpression: 'SET #group = :group'
        })
      );
    }
  };

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

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
 *             $ref: '#/components/schemas/MergeGroupsUpdate'
 *     responses:
 *       422:
 *         description: Le format des données fournies dans le body doit correspondre à un ensemble de groupes de fusion valide.
 *       200:
 *         description: Les groupes de fusion et la création des lieux fusionnés ont étés traités avec succès.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const mergeGroupUpdate: MergeGroupsUpdateTransfer = JSON.parse(event.body ?? '{}');
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    console.log('before remove merge groups', mergeGroupUpdate.groupIdsToDelete.length);

    const mergedLieuxToDeleteChunks: string[][] = Array.from(chunks(mergeGroupUpdate.groupIdsToDelete, 100));
    let i = 0;

    for (const mergedLieuxToDeleteChunk of mergedLieuxToDeleteChunks) {
      i++;
      console.log(`chunk ${i} / ${mergedLieuxToDeleteChunks.length}`);

      const mergedLieuxToDelete: MergedLieuInclusionNumeriqueStorage[] = await scanAll<MergedLieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        filter(
          or(
            ...mergedLieuxToDeleteChunk.map((groupId: string) =>
              attribute<MergedLieuInclusionNumeriqueStorage>('group', equals(groupId))
            )
          ),
          attributeExists('mergedIds')
        )
      );

      for (const mergedLieuToDelete of mergedLieuxToDelete) {
        await docClient.send(
          new TransactWriteItemsCommand({
            TransactItems: [
              {
                Delete: {
                  TableName: TABLE_NAME,
                  Key: { id: { S: mergedLieuToDelete.id } }
                }
              },
              ...mergedLieuToDelete.mergedIds.map((id: string) => ({
                Update: {
                  Key: { id: { S: id } },
                  TableName: TABLE_NAME,
                  ExpressionAttributeNames: { '#group': 'group' },
                  UpdateExpression: 'REMOVE #group'
                }
              }))
            ]
          })
        );
      }
    }

    console.log('before add merge group and save merged lieux', mergeGroupUpdate.mergeGroups.length);
    for (const mergeGroup of mergeGroupUpdate.mergeGroups) {
      await addMergeGroupForAllLieuxIn(docClient)(mergeGroup);
      await saveMergedLieuFrom(docClient)(mergeGroup);
    }

    return successResponse({
      message: 'Les groupes de fusion et la création des lieux fusionnés ont étés traités avec succès.'
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Le format des données fournies dans le body doit correspondre à un ensemble de groupes de fusion valide.'
      })
    };
  }
};
