import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import qs from 'qs';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { env } from '../../../env';
import { toTask } from '../../../fp-helpers';
import { Paginated, paginationFromQueryString, queryStringFilter, scanPaginated } from '../../dynamo-db';
import { toRawQueryString } from '../../gateway';
import { failureResponse, gzipResponse, successResponse } from '../../responses';
import { LieuInclusionNumeriqueStorage } from '../../storage';
import { ServicesInclusionTransfer, toSchemaServicesDataInclusionWithGroups } from '../../transfers';

const toPaginatedServicesInclusion = (
  paginated: Paginated<LieuInclusionNumeriqueStorage>
): Paginated<ServicesInclusionTransfer> => ({
  ...paginated,
  data: toSchemaServicesDataInclusionWithGroups(paginated.data)
});

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
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2<ServicesInclusionTransfer>> =>
  pipe(
    fromTask(() =>
      scanPaginated<LieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        paginationFromQueryString(qs.parse(toRawQueryString(event.queryStringParameters))),
        `${env.BASE_URL}${event.path}`,
        queryStringFilter(toRawQueryString(event.queryStringParameters))
      )
    ),
    map(toPaginatedServicesInclusion),
    map(successResponse),
    map(gzipResponse),
    getOrElse(toTask(failureResponse))
  )();
