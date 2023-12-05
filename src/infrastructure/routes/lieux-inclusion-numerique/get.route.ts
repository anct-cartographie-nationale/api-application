import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toSchemaLieuxDeMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { toTask } from '../../../fp-helpers';
import {
  QueryCommandExpression,
  scanAll,
  queryStringFilter,
  filter,
  attributeNotExists,
  attributeExists,
  or
} from '../../dynamo-db';
import { toRawQueryString } from '../../gateway';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { LieuInclusionNumeriqueStorage, toStringDateMaj } from '../../storage';
import { LieuxInclusionNumeriqueTransfer } from '../../transfers';

const DEFAULT_FILTER: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
  or(attributeNotExists('group'), attributeExists('mergedIds'))
);

const filterFromQueryString = (queryStringParameters?: APIGatewayProxyEventQueryStringParameters): QueryCommandExpression =>
  queryStringParameters == null
    ? DEFAULT_FILTER
    : queryStringFilter(
        toRawQueryString({ ...queryStringParameters, 'and[or][mergedIds][exists]': 'true', 'and[or][group][exists]': 'false' })
      );

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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LieuInclusionNumerique'
 */
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2<LieuxInclusionNumeriqueTransfer[]>> =>
  pipe(
    fromTask(() =>
      scanAll<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        filterFromQueryString(event.queryStringParameters)
      )
    ),
    map((lieuxInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage[]) =>
      lieuxInclusionNumeriqueStorage.map(toStringDateMaj)
    ),
    map(toSchemaLieuxDeMediationNumerique),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
