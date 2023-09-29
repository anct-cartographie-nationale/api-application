import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SourceTransfer } from '../../transfers/source.transfer';
import { successResponse } from '../../responses';

/**
 * @openapi
 * /sources:
 *   put:
 *     summary: Ajouter ou modifier une source de données.
 *     description: Ajoute une nouvelle source de données si aucune n'existe avec le même non, sinon la source de données correspondante sera mise à jour.
 *     operationId: sources.put
 *     security:
 *       - ApiKeyAuthorization: []
 *     requestBody:
 *       description: Source de données à ajouter ou modifier
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Source'
 *     responses:
 *       401:
 *         description: La clé d'API est manquante ou invalide.
 *       200:
 *           description: La source de données a été mise à jour.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<SourceTransfer>> => {
  const { name, hash } = JSON.parse(event.body ?? '');

  if (name == null || hash == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Les champs "name" et "hash" sont obligatoires' })
    };
  }

  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient());
  const putCommand: PutCommand = new PutCommand({
    TableName: 'cartographie-nationale.sources',
    Item: { name, hash }
  });

  const response: PutCommandOutput = await docClient.send(putCommand);

  return successResponse(response);
};
