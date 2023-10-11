import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { toSchemaServicesDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique/lib/cjs/models';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../fp-helpers';
import { scanAll } from '../../dynamo-db';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { ServicesInclusionTransfer } from '../../transfers';

/**
 * @openapi
 * /services-inclusion:
 *   get:
 *     summary: Récupérer la liste des services au schéma data.incusion.
 *     description: La liste des services suivant le [schéma des services d'insertion](https://www.data.inclusion.beta.gouv.fr/schemas-de-donnees-de-loffre/schema-des-structures-et-services-dinsertion#schema-service) décrit ensemble des services disponibles sur la thématique numérique.
 *     operationId: services-inclusion.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des services au schéma data.incusion.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServiceDataInclusion'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2<ServicesInclusionTransfer>> =>
  pipe(
    fromTask(() => scanAll<LieuMediationNumerique>('cartographie-nationale.lieux-inclusion-numerique')),
    map(toSchemaServicesDataInclusion),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
