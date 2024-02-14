import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { attributeNotExists, filter, scanAll } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage } from '../../../storage';

const TABLE_NAME = 'cartographie-nationale.lieux-inclusion-numerique' as const;

const markAllAsDeduplicated = async (docClient: DynamoDBDocumentClient) => {
  console.log('before mark as deduplicated');
  const lieux: LieuInclusionNumeriqueStorage[] = await scanAll<LieuInclusionNumeriqueStorage>(
    TABLE_NAME,
    filter(attributeNotExists('deduplicated'))
  );
  console.log(`Mark ${lieux.length} lieux as deduplicated`);
  const lieuxChunks: LieuInclusionNumeriqueStorage[][] = Array.from(chunks(lieux, 10));
  let i = 0;
  for (const lieuxChunk of lieuxChunks) {
    i++;
    console.log(`chunk ${i} / ${lieuxChunks.length}`);

    await docClient.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          ...lieuxChunk.map((lieu: LieuInclusionNumeriqueStorage) => ({
            Put: {
              TableName: TABLE_NAME,
              Item: { ...marshall({ ...lieu, deduplicated: true }) }
            }
          }))
        ]
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
 * /lieux-inclusion-numerique/mark-all-as-deduplicated:
 *   patch:
 *     summary: Mettre à jour l'indicateur de déduplication de l'ensemble des lieux.
 *     description: Cette opération permet d'indiquer que tous les lieux ont été dédupliqués, ainsi ce statut indique qu'en l'état ces lieux ne seront pas concernés par une prochaine fusion.
 *     operationId: lieux-inclusion-numerique-mark-all-as-deduplicated.patch
 *     security:
 *       - ApiKeyAuthorization: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: Le marquage des lieux dédupliqués a été traité avec succès.
 */
export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  await markAllAsDeduplicated(docClient);

  return successResponse({ message: 'Le marquage des lieux dédupliqués a été traité avec succès.' });
};
