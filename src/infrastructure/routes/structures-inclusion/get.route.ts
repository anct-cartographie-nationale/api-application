import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { toSchemaStructuresDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique/lib/cjs/models';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../fp-helpers';
import { scanAll } from '../../dynamo-db';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { StructuresInclusionTransfer } from '../../transfers';

/**
 * @openapi
 * /structures-inclusion:
 *   get:
 *     summary: Récupérer la liste des structures au schéma data.incusion.
 *     description: La liste des structures suivant le [schéma des structures d'insertion](https://www.data.inclusion.beta.gouv.fr/schemas-de-donnees-de-loffre/schema-des-structures-et-services-dinsertion#schema-structure) décrit les structures qui proponent au moins un service de médiation numérique.
 *     operationId: structures-inclusion.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des structures au schéma data.incusion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StructureDataInclusion'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2<StructuresInclusionTransfer>> =>
  pipe(
    fromTask(() => scanAll<LieuMediationNumerique>('cartographie-nationale.lieux-inclusion-numerique')),
    map(toSchemaStructuresDataInclusion),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
