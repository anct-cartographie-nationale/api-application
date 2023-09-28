import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { scanAll } from '../../dynamo-db';
import { gzipedSuccessResponse } from '../../responses';
import { LieuxInclusionNumeriqueTransfer } from '../../transfers';

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
 *                     $ref: '#/components/schemas/LieuInclusionNumerique'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2<LieuxInclusionNumeriqueTransfer>> =>
  gzipedSuccessResponse(toSchemaLieuxDeMediationNumerique(await scanAll('LieuxInclusionNumerique')));
