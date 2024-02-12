import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DeleteCommandOutput,
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
  QueryCommand,
  UpdateCommand,
  UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb';
import { scanAll } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage, MergedLieuInclusionNumeriqueStorage } from '../../../storage';
import { FingerprintTransfer } from '../../../transfers';

const deleteLieuById =
  (docClient: DynamoDBDocumentClient) =>
  (id: string): Promise<DeleteCommandOutput> =>
    docClient.send(new DeleteCommand({ TableName: 'cartographie-nationale.lieux-inclusion-numerique', Key: { id } }));

const onlyOutOf =
  (idsToRemove: string[]) =>
  (idToRemove: string): boolean =>
    !idsToRemove.includes(idToRemove);

const removeGroup =
  (docClient: DynamoDBDocumentClient) =>
  (id: string): Promise<UpdateCommandOutput> =>
    docClient.send(
      new UpdateCommand({
        Key: { id },
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        ExpressionAttributeNames: { '#group': 'group' },
        UpdateExpression: 'REMOVE #group'
      })
    );

const updateMergedIds =
  (docClient: DynamoDBDocumentClient) =>
  (mergedLieu: MergedLieuInclusionNumeriqueStorage, mergedIds: string[]): Promise<PutCommandOutput> =>
    docClient.send(
      new PutCommand({ TableName: 'cartographie-nationale.lieux-inclusion-numerique', Item: { ...mergedLieu, mergedIds } })
    );

const removeIdsFromMergedLieuFor =
  (docClient: DynamoDBDocumentClient) =>
  (idsToRemove: string[]) =>
  async (mergedLieu: MergedLieuInclusionNumeriqueStorage): Promise<void> => {
    const remainingIds: string[] = (mergedLieu.mergedIds ?? []).filter(onlyOutOf(idsToRemove));
    await updateMergedIds(docClient)(mergedLieu, remainingIds);

    if (remainingIds.length >= 2) return;

    await Promise.all(remainingIds.map(removeGroup(docClient)));
    await deleteLieuById(docClient)(mergedLieu.id);
  };

const findLieuxBySourceIndex =
  (docClient: DynamoDBDocumentClient) =>
  async (source: string, id: string): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    (
      await docClient.send(
        new QueryCommand({
          TableName: 'cartographie-nationale.lieux-inclusion-numerique',
          IndexName: 'source-index',
          ExpressionAttributeNames: {
            '#source': 'source',
            '#sourceId': 'sourceId'
          },
          ExpressionAttributeValues: {
            ':source': source,
            ':sourceId': id
          },
          KeyConditionExpression: '#source = :source and #sourceId = :sourceId'
        })
      )
    ).Items?.[0] as LieuInclusionNumeriqueStorage | undefined;

const onlyWithoutHash = (fingerprint: FingerprintTransfer): boolean => fingerprint.hash == null;

const onlyWithHash = (fingerprint: FingerprintTransfer): boolean => fingerprint.hash != null;

const toMergedLieuFor = async (id: string): Promise<MergedLieuInclusionNumeriqueStorage | undefined> =>
  (
    await scanAll<MergedLieuInclusionNumeriqueStorage>('cartographie-nationale.lieux-inclusion-numerique', {
      ExpressionAttributeNames: { '#mergedIds': 'mergedIds' },
      ExpressionAttributeValues: { ':id': id },
      FilterExpression: 'contains(#mergedIds, :id)'
    })
  ).at(0);

const onlyDefined = <T>(nullable: T | undefined): nullable is T => nullable != null;

const toLieuWithHash =
  (fingerprints: FingerprintTransfer[]) =>
  (lieu: LieuInclusionNumeriqueStorage): LieuInclusionNumeriqueStorage => ({
    ...lieu,
    hash: fingerprints.find((fingerprint: FingerprintTransfer): boolean => fingerprint.sourceId === lieu.sourceId)?.hash ?? ''
  });

const updateItem =
  (docClient: DynamoDBDocumentClient) =>
  (lieu: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    docClient.send(new PutCommand({ TableName: 'cartographie-nationale.lieux-inclusion-numerique', Item: lieu }));

const toMatchingLieuIn =
  (docClient: DynamoDBDocumentClient) =>
  (source: string) =>
  ({ sourceId }: FingerprintTransfer): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    findLieuxBySourceIndex(docClient)(source, sourceId);

/**
 * @openapi
 * /lieux-inclusion-numerique/fingerprints/{source}:
 *   patch:
 *     summary: Mettre à jour les empreintes numériques pour les lieux de médiation numérique dont la source et l'identifiant correspondent.
 *     description: Cette opération permet de mettre à jour les empreintes des lieux d'inclusion numérique en leur attribuant de nouvelles empreintes ou en modifiant les empreintes existantes pour chaque lieu correspondant aux références fournies.
 *     operationId: lieux-inclusion-numerique-fingerprints.patch
 *     parameters:
 *       - in: path
 *         name: source
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de la source de données à partir de laquelle récupérer la liste des empreintes numériques.
 *     security:
 *       - ApiKeyAuthorization: []
 *     requestBody:
 *       description: Les empreintes numériques à ajouter ou modifier pour les lieux d'inclusion numérique associés.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Fingerprint'
 *     responses:
 *       422:
 *         description: Le format des données fournies dans le body doit correspondre à un tableau empreintes numériques valide.
 *       200:
 *         description: Les empreintes numériques à associer aux lieux ou conduisant à leur suppression ont étés traités avec succès.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const source: string | undefined = event.pathParameters?.['source'];

  console.log('Update fingerprints for source', source);

  if (source == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Le paramètres "source" est obligatoire dans le chemin' })
    };
  }

  const fingerprints: FingerprintTransfer[] = JSON.parse(event.body ?? '[]');
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    const lieuxToRemoveIds: string[] = fingerprints
      .filter(onlyWithoutHash)
      .map((fingerprint: FingerprintTransfer): string => fingerprint.sourceId);

    const fingerprintsWithHash: FingerprintTransfer[] = fingerprints.filter(onlyWithHash);

    console.log(lieuxToRemoveIds.length, 'lieux to remove');
    console.log(fingerprintsWithHash.length, 'lieux to update');

    console.log('before find lieux matching fingerprints');
    const lieux: LieuInclusionNumeriqueStorage[] = (
      await Promise.all(fingerprintsWithHash.map(toMatchingLieuIn(docClient)(source)))
    )
      .filter(onlyDefined)
      .map(toLieuWithHash(fingerprints));

    console.log(lieux.length, 'lieux matching fingerprints found');

    console.log('before set fingerprint');
    await Promise.all(lieux.map(updateItem(docClient)));

    console.log('before remove lieux');
    await Promise.all(lieuxToRemoveIds.map(deleteLieuById(docClient)));

    console.log('before get merged lieux matching removed lieux');
    const mergedLieuxToUpdate: MergedLieuInclusionNumeriqueStorage[] = (
      await Promise.all(lieuxToRemoveIds.map(toMergedLieuFor))
    ).filter(onlyDefined);

    console.log('before remove merged lieux');
    await Promise.all(mergedLieuxToUpdate.map(removeIdsFromMergedLieuFor(docClient)(lieuxToRemoveIds)));

    return successResponse({
      message: 'Les empreintes numériques à associer aux lieux ou conduisant à leur suppression ont étés traités avec succès.'
    });
  } catch (error) {
    console.error(error);
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Le format des données fournies dans le body doit correspondre à un tableau empreintes numériques valide.'
      })
    };
  }
};
