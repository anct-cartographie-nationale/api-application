import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { findLieuxBySourceIndex } from '../../../dynamo-db';
import { successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage } from '../../../storage';
import { FingerprintTransfer } from '../../../transfers';

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
    await Promise.all(
      fingerprints.map(async (fingerprint: FingerprintTransfer): Promise<PutCommandOutput | undefined> => {
        const lieuInclusionNumeriqueFound: LieuInclusionNumeriqueStorage | undefined = await findLieuxBySourceIndex(docClient)(
          source,
          fingerprint.sourceId
        );

        if (lieuInclusionNumeriqueFound == null) return;

        return fingerprint.hash == null
          ? docClient.send(
              new DeleteCommand({
                TableName: 'cartographie-nationale.lieux-inclusion-numerique',
                Key: { id: lieuInclusionNumeriqueFound.id }
              })
            )
          : docClient.send(
              new PutCommand({
                TableName: 'cartographie-nationale.lieux-inclusion-numerique',
                Item: { ...lieuInclusionNumeriqueFound, hash: fingerprint.hash }
              })
            );
      })
    );

    return successResponse({
      message: 'Les empreintes numériques à associer aux lieux ou conduisant à leur suppression ont étés traités avec succès.'
    });
  } catch {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Le format des données fournies dans le body doit correspondre à un tableau empreintes numériques valide.'
      })
    };
  }
};
