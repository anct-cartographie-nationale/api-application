import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { fromLieuxInclusionNumeriqueStorage, ReadFingerprintTransfer } from '../../../transfers';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../../storage';

/**
 * @openapi
 * /lieux-inclusion-numerique/fingerprints/{source}:
 *   get:
 *     summary: Récupérer la liste des empreintes numériques des lieux de médiation numérique.
 *     description: La liste des empreintes numériques des lieux d'inclusion numérique permet de déduire les modifications qui ont été opérées sur certains enregistrements depuis la dernière transformation.
 *     operationId: lieux-inclusion-numerique-fingerprints.get
 *     parameters:
 *       - in: path
 *         name: source
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de la source de données à partir de laquelle récupérer la liste des empreintes numériques.
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des empreintes numériques.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fingerprint'
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<ReadFingerprintTransfer[]>> => {
  const source: string | undefined = event.pathParameters?.['source'];

  if (source == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Le paramètres "name" est obligatoire dans le chemin' })
    };
  }

  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

  const lieuxInclusion: LieuInclusionNumeriqueStorage[] = (
    await docClient.send(
      new QueryCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        IndexName: 'source-index',
        ExpressionAttributeNames: { '#source': 'source' },
        ExpressionAttributeValues: { ':source': source },
        KeyConditionExpression: '#source = :source'
      })
    )
  ).Items as LieuInclusionNumeriqueStorage[];

  return fromLieuxInclusionNumeriqueStorage(lieuxInclusion);
};
