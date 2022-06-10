import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { LieuxMediationNumeriqueTransfer } from '../../transfers';

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
  const lieuxMediationNumerique: LieuxMediationNumeriqueTransfer[] = [
    {
      id: '61e9260c2ac971550065e262',
      latitude: 45.727292,
      longitude: 4.88428,
      nom: "Maison Lyon pour l'Emploi - Lyon 8"
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lieuxMediationNumerique)
  };
};
