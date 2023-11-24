import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import qs from 'qs';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { env } from '../../../env';
import { toTask } from '../../../fp-helpers';
import { Paginated, paginationFromQueryString, scanPaginated } from '../../dynamo-db';
import { toRawQueryString } from '../../gateway';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { LieuInclusionNumeriqueStorage } from '../../storage';
import { StructuresInclusionTransfer, toSchemaStructuresDataInclusionWithGroups } from '../../transfers';

const toPaginatedStructuresInclusion = (
  paginated: Paginated<LieuInclusionNumeriqueStorage>
): Paginated<StructuresInclusionTransfer> => ({
  ...paginated,
  data: toSchemaStructuresDataInclusionWithGroups(paginated.data)
});

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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StructureDataInclusion'
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2<Paginated<StructuresInclusionTransfer>>> =>
  pipe(
    fromTask(() =>
      scanPaginated<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        paginationFromQueryString(qs.parse(toRawQueryString(event.queryStringParameters))),
        `${env.BASE_URL}${event.path}`
      )
    ),
    map(toPaginatedStructuresInclusion),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
