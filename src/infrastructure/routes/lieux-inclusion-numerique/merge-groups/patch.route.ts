import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { fromSchemaLieuDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { filter, findLieuById, scanAll, attributeNotExists, findMergedLieuByGroupId } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import {
  LieuInclusionNumeriqueStorage,
  markAsDeduplicated,
  MergedLieuInclusionNumeriqueStorage,
  toISOStringDateMaj,
  upsertLieu
} from '../../../storage';
import { MergeGroupTransfer, MergeGroupsUpdateTransfer } from '../../../transfers';

const removeGroupFrom =
  (docClient: DynamoDBDocumentClient) =>
  async ({ group, ...lieuWithoutGroup }: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    await docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: lieuWithoutGroup
      })
    );

const removeAllGroups =
  (docClient: DynamoDBDocumentClient) =>
  async (ids: string[]): Promise<void> => {
    await Promise.all(
      ids.map(async (id: string): Promise<PutCommandOutput | undefined> => {
        const lieu: LieuInclusionNumeriqueStorage | undefined = await findLieuById(docClient)(id);
        if (lieu == null) {
          console.log('No lieu found that should have its group removed for:', id);
          return;
        }
        console.log('Lieu with group to remove', lieu);

        return await removeGroupFrom(docClient)(lieu);
      })
    );
  };

const deleteLieuById = (docClient: DynamoDBDocumentClient) => (id: string) =>
  docClient.send(
    new DeleteCommand({
      TableName: 'cartographie-nationale.lieux-inclusion-numerique',
      Key: { id }
    })
  );

const addMergeGroupIdToMergedLieux =
  (docClient: DynamoDBDocumentClient) =>
  (group: string) =>
  async (mergedLieuId: string): Promise<PutCommandOutput> =>
    await docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: { ...(await findLieuById(docClient)(mergedLieuId)), group }
      })
    );

const applyMarge =
  (docClient: DynamoDBDocumentClient) =>
  async (mergeGroup: MergeGroupTransfer): Promise<void> => {
    await Promise.all(mergeGroup.mergedIds.map(addMergeGroupIdToMergedLieux(docClient)(mergeGroup.groupId)));

    await upsertLieu(docClient)({
      ...toISOStringDateMaj(fromSchemaLieuDeMediationNumerique(mergeGroup.lieu)),
      mergedIds: mergeGroup.mergedIds,
      group: mergeGroup.groupId
    });
  };

const markAllAsDeduplicated = async (docClient: DynamoDBDocumentClient): Promise<PutCommandOutput[]> =>
  await Promise.all(
    (
      await scanAll<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        filter<LieuInclusionNumeriqueStorage>(attributeNotExists('deduplicated'))
      )
    ).map(markAsDeduplicated(docClient))
  );

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
  const mergeGroupUpdate: MergeGroupsUpdateTransfer = JSON.parse(event.body ?? '[]');
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    await Promise.all(
      mergeGroupUpdate.groupIdsToDelete.map(async (groupId: string): Promise<void> => {
        const mergedLieuToDelete: MergedLieuInclusionNumeriqueStorage | undefined = await findMergedLieuByGroupId(groupId);

        if (mergedLieuToDelete == null) {
          console.log('No merged lieu to delete found with group id to delete:', groupId);
          return;
        }

        console.log('Merged lieu to delete', mergedLieuToDelete);
        await removeAllGroups(docClient)(mergedLieuToDelete.mergedIds);

        await deleteLieuById(docClient)(mergedLieuToDelete.id);
      })
    );

    await Promise.all(mergeGroupUpdate.mergeGroups.map(applyMarge(docClient)));

    await markAllAsDeduplicated(docClient);

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
