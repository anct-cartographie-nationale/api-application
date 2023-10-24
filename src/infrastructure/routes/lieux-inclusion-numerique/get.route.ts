import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import qs from 'qs';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toSchemaLieuxDeMediationNumerique, LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { toTask } from '../../../fp-helpers';
import { filterFromParsedQueryString, QueryFilter, scanAll } from '../../dynamo-db';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { LieuxInclusionNumeriqueTransfer } from '../../transfers';
import { LieuInclusionNumeriqueStorage } from '../../storage';

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
): Promise<APIGatewayProxyResultV2<LieuxInclusionNumeriqueTransfer>> =>
  pipe(
    fromTask(() =>
      scanAll<LieuMediationNumerique>(
        'cartographie-nationale.lieux-inclusion-numerique',
        filterFromParsedQueryString<LieuInclusionNumeriqueStorage>(
          qs.parse(event.rawQueryString) as QueryFilter<LieuInclusionNumeriqueStorage>
        )
      )
    ),
    map(toSchemaLieuxDeMediationNumerique),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
