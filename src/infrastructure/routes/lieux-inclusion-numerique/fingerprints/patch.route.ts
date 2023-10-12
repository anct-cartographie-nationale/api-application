import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { findLieuxBySourceIndex, LieuInclusionNumeriqueStorage, upsertLieu } from '../../../storage';
import { successResponse } from '../../../responses';
import { FingerprintTransfer } from '../../../transfers';

/**
 * @openapi
 * /lieux-inclusion-numerique/fingerprints:
 *   patch:
 *     summary: Mettre à jour les empreintes numériques pour les lieux de médiation numérique dont la source et l'identifiant correspondent.
 *     description: Cette opération permet de mettre à jour les empreintes des lieux d'inclusion numérique en leur attribuant de nouvelles empreintes ou en modifiant les empreintes existantes pour chaque lieu correspondant aux références fournies.
 *     operationId: lieux-inclusion-numerique-fingerprints.patch
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
 *       500:
 *         description: Non implémenté pour le moment.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const fingerprints: FingerprintTransfer[] = JSON.parse(event.body ?? '[]');
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    await Promise.all(
      fingerprints.map(async (fingerprint: FingerprintTransfer): Promise<PutCommandOutput | undefined> => {
        const lieuInclusionNumeriqueFound: LieuInclusionNumeriqueStorage | undefined = await findLieuxBySourceIndex(docClient)(
          fingerprint.source,
          fingerprint.sourceId
        );

        if (lieuInclusionNumeriqueFound == null) return;

        return upsertLieu(docClient)(
          {
            ...lieuInclusionNumeriqueFound,
            hash: fingerprint.hash
          },
          lieuInclusionNumeriqueFound
        );
      })
    );

    return successResponse({
      message: 'Les empreintes numériques à associer aux lieux ont étés traités avec succès.'
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
