import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique/lib/cjs/models';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../fp-helpers';
import { scanAll } from '../../dynamo-db';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
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
  pipe(
    fromTask(() => scanAll<LieuMediationNumerique>('cartographie-nationale.lieux-inclusion-numerique')),
    map(toSchemaLieuxDeMediationNumerique),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
