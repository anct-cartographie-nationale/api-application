import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import qs from 'qs';
import { SchemaLieuMediationNumerique, toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { env } from '../../../../env';
import { toTask } from '../../../../fp-helpers';
import { Paginated, paginationFromQueryString, queryStringFilter, scanPaginated } from '../../../dynamo-db';
import { failureResponse, gzipResponse, noCacheResponse, successResponse } from '../../../responses';
import { LieuInclusionNumeriqueStorage, toStringDateMaj } from '../../../storage';
import { LieuxInclusionNumeriqueTransfer } from '../../../transfers';
import { toRawQueryString } from '../../../gateway';

const toPaginatedSchemaLieuxDeMediationNumerique = (
  paginated: Paginated<LieuInclusionNumeriqueStorage>
): Paginated<SchemaLieuMediationNumerique> => ({
  ...paginated,
  data: toSchemaLieuxDeMediationNumerique(paginated.data.map(toStringDateMaj))
});

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
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2<LieuxInclusionNumeriqueTransfer[]>> =>
  pipe(
    fromTask(() =>
      scanPaginated<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        paginationFromQueryString(qs.parse(toRawQueryString(event.queryStringParameters))),
        `${env.BASE_URL}${event.path}`,
        queryStringFilter(toRawQueryString(event.queryStringParameters))
      )
    ),
    map(toPaginatedSchemaLieuxDeMediationNumerique),
    map(successResponse),
    map(gzipResponse),
    map(noCacheResponse),
    getOrElse(toTask(failureResponse))
  )();
