import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { LieuMediationNumerique, toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';

/**
 * @openapi
 * /lieux-inclusion-numerique:
 *   get:
 *     summary: Récupérer la liste des lieux d'inclusion numérique.
 *     description: La liste des lieux d'inclusion numérique décrit les lieux où un médiateur numérique est présent pour proposer des services de médiation numérique, elle est définie par le [schéma des données de médiation numérique](https://lamednum.coop/schema-de-donnees-des-lieux-de-mediation-numerique-2/).
 *     operationId: lieux-inclusion-numerique.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des lieux d'inclusion numérique.
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

  const lieuxMediationNumerique: LieuMediationNumerique[] = [];
  let ExclusiveStartKey: Record<string, LieuMediationNumerique> | undefined;

  do {
    const scanCommand: ScanCommand = new ScanCommand({
      TableName: 'LieuxInclusionNumerique',
      ...(ExclusiveStartKey ? { ExclusiveStartKey } : {})
    });

    const dynamoDBResponse: ScanCommandOutput = await docClient.send(scanCommand);
    lieuxMediationNumerique.push(...((dynamoDBResponse.Items ?? []) as LieuMediationNumerique[]));

    ExclusiveStartKey = dynamoDBResponse.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(toSchemaLieuxDeMediationNumerique(lieuxMediationNumerique))
  };
};
