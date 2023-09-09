import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { LieuMediationNumerique, toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';

/**
 * @openapi
 * /lieux-mediation-numerique:
 *   get:
 *     summary: Récupère la liste des lieux de médiation numérique.
 *     description: La liste des lieux de médiation numérique décrit les lieux où un médiateur numérique est présent pour proposer des services de médiation numérique, elle est définie par le schéma des données de médiation numérique.
 *     responses:
 *       200:
 *         description: La liste des lieux de médiation numérique.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LieuMediationNumerique'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);
  const scanCommand: ScanCommand = new ScanCommand({ TableName: 'LieuxInclusionNumerique' });

  const dynamoDBResponse: ScanCommandOutput = await docClient.send(scanCommand);
  const lieuxMediationNumerique: LieuMediationNumerique[] = (dynamoDBResponse.Items ?? []) as LieuMediationNumerique[];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(toSchemaLieuxDeMediationNumerique(lieuxMediationNumerique))
  };
};
