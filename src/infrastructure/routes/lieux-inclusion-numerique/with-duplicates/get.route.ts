import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { queryStringFilter, scanAll } from '../../../dynamo-db';
import { toTask } from '../../../../fp-helpers';
import { failureResponse, gzipResponse, noCacheResponse, successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage, toStringDateMaj } from '../../../storage';
import { LieuxInclusionNumeriqueTransfer } from '../../../transfers';
import { toRawQueryString } from '../../../gateway';

/**
 * @openapi
 * /lieux-inclusion-numerique/with-duplicates:
 *   get:
 *     summary: Récupérer la liste des lieux d'inclusion numérique avec les doublons.
 *     description: La liste des lieux d'inclusion numérique décrit les lieux où un médiateur numérique est présent pour proposer des services de médiation numérique, elle est définie par le [schéma des données de médiation numérique](https://lamednum.coop/schema-de-donnees-des-lieux-de-mediation-numerique-2/).
 *     operationId: lieux-inclusion-numerique-with-duplicates.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des lieux d'inclusion numérique avec les doublons.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LieuInclusionNumerique'
 */
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<LieuxInclusionNumeriqueTransfer[]>> => {
  console.log(queryStringFilter(toRawQueryString(event.queryStringParameters)));

  return pipe(
    fromTask(() =>
      scanAll<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        queryStringFilter(toRawQueryString(event.queryStringParameters))
      )
    ),
    map((lieuxInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage[]) =>
      lieuxInclusionNumeriqueStorage.map(toStringDateMaj)
    ),
    map(toSchemaLieuxDeMediationNumerique),
    map(successResponse),
    map(gzipResponse),
    map(noCacheResponse),
    getOrElse(toTask(failureResponse))
  )();
};
