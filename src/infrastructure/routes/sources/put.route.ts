import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { successResponse } from '../../responses';
import { SourceHashTransfer } from '../../transfers';

/**
 * @openapi
 * /sources/{name}:
 *   put:
 *     summary: Ajouter ou modifier une source de données.
 *     description: Ajoute une nouvelle source de données si aucune n'existe avec le même non, sinon la source de données correspondante sera mise à jour.
 *     operationId: sources.put
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de la source dont les données ont été récupérées pour constituer la liste des lieux d'inclusion numérique.
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
 *       422:
 *         description: Le champ "hash" est obligatoire dans le body.
 *       200:
 *          description: La source de données a été mise à jour.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const source: SourceHashTransfer | undefined = event?.body as SourceHashTransfer | undefined;
  const name: string | undefined = event.pathParameters?.['name'];

  if (name == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Le paramètres "name" est obligatoire dans le chemin' })
    };
  }

  if (source?.hash == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Le champ "hash" est obligatoire dans le body' })
    };
  }

  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient());
  const putCommand: PutCommand = new PutCommand({
    TableName: 'cartographie-nationale.sources',
    Item: { name, hash: source.hash }
  });

  const response: PutCommandOutput = await docClient.send(putCommand);

  return successResponse(response);
};
