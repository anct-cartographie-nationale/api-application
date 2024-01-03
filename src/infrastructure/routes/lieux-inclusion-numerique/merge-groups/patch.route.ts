import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
  UpdateCommand,
  UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb';
import { fromSchemaLieuDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { findMergedLieuByGroupId, scanAll } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import {
  LieuInclusionNumeriqueStorage,
  MergedLieuInclusionNumeriqueStorage,
  toISOStringDateMaj,
  upsertLieu
} from '../../../storage';
import { MergeGroupsUpdateTransfer, MergeGroupTransfer } from '../../../transfers';

const removeMergeGroup =
  (docClient: DynamoDBDocumentClient) =>
  async (id: string): Promise<UpdateCommandOutput> =>
    await docClient.send(
      new UpdateCommand({
        Key: { id },
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        ExpressionAttributeNames: { '#group': 'group' },
        UpdateExpression: 'REMOVE #group'
      })
    );

const removeMergeGroupForAllLieuxIn =
  (docClient: DynamoDBDocumentClient) =>
  async (ids: string[]): Promise<UpdateCommandOutput[]> =>
    await Promise.all(ids.map(removeMergeGroup(docClient)));

const deleteLieuById = (docClient: DynamoDBDocumentClient) => async (id: string) =>
  await docClient.send(new DeleteCommand({ TableName: 'cartographie-nationale.lieux-inclusion-numerique', Key: { id } }));

const markAsDeduplicated =
  (docClient: DynamoDBDocumentClient) =>
  async (lieuInclusionNumerique: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    await docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: { ...lieuInclusionNumerique, deduplicated: true }
      })
    );

const lieuxToDeduplicate = async (): Promise<LieuInclusionNumeriqueStorage[]> =>
  await scanAll<LieuInclusionNumeriqueStorage>('cartographie-nationale.lieux-inclusion-numerique', {
    ExpressionAttributeNames: { '#0': 'deduplicated' },
    FilterExpression: 'attribute_not_exists(#0)'
  });

const saveMergedLieuFrom =
  (docClient: DynamoDBDocumentClient) =>
  async (mergeGroup: MergeGroupTransfer): Promise<PutCommandOutput> =>
    await upsertLieu(docClient)({
      ...toISOStringDateMaj(fromSchemaLieuDeMediationNumerique(mergeGroup.lieu)),
      mergedIds: mergeGroup.mergedIds,
      group: mergeGroup.groupId
    });

const setMergeGroupTo =
  (docClient: DynamoDBDocumentClient) =>
  (groupId: string) =>
  async (id: string): Promise<UpdateCommandOutput> =>
    await docClient.send(
      new UpdateCommand({
        Key: { id },
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        ExpressionAttributeNames: { '#group': 'group' },
        ExpressionAttributeValues: { ':group': groupId },
        UpdateExpression: 'SET #group = :group'
      })
    );

const addMergeGroupForAllLieuxIn =
  (docClient: DynamoDBDocumentClient) =>
  async ({ groupId, mergedIds }: MergeGroupTransfer): Promise<PutCommandOutput[]> =>
    await Promise.all(mergedIds.map(setMergeGroupTo(docClient)(groupId)));

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
    for (const groupId of mergeGroupUpdate.groupIdsToDelete) {
      console.log('remove', groupId);
      const mergedLieuToDelete: MergedLieuInclusionNumeriqueStorage | undefined = await findMergedLieuByGroupId(groupId);
      if (mergedLieuToDelete == null) continue;
      await removeMergeGroupForAllLieuxIn(docClient)(mergedLieuToDelete.mergedIds);
      await deleteLieuById(docClient)(mergedLieuToDelete.id);
    }

    console.log('before add merge group and save merged lieux', mergeGroupUpdate.mergeGroups.length);
    for (const mergeGroup of mergeGroupUpdate.mergeGroups) {
      await addMergeGroupForAllLieuxIn(docClient)(mergeGroup);
      await saveMergedLieuFrom(docClient)(mergeGroup);
    }

    console.log('before mark as deduplicated');
    if (event.queryStringParameters?.['markAsDeduplicated'] === 'true') {
      const lieux = await lieuxToDeduplicate();
      for (const lieu of lieux) {
        console.log('mark', lieu.id, 'as deduplicated');
        await markAsDeduplicated(docClient)(lieu);
      }
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
