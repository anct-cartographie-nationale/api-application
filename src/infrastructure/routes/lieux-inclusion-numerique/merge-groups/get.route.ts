import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import qs from 'qs';
import { env } from '../../../../env';
import { toTask } from '../../../../fp-helpers';
import { attributeExists, filter, Paginated, paginationFromQueryString, scanPaginated } from '../../../dynamo-db';
import { MergedLieuInclusionNumeriqueStorage } from '../../../storage';
import { MergeGroupTransfer, mergeGroupTransferFormLieux } from '../../../transfers';
import { failureResponse, noCacheResponse, successResponse } from '../../../responses';
import { toRawQueryString } from '../../../gateway';

const toPaginatedMergeGroupTransferFormLieux = (
  paginated: Paginated<MergedLieuInclusionNumeriqueStorage>
): Paginated<MergeGroupTransfer> => ({
  ...paginated,
  data: mergeGroupTransferFormLieux(paginated.data)
});

/**
 * @openapi
 * /lieux-inclusion-numerique/merge-groups:
 *   get:
 *     summary: Récupérer la liste des identifiants de groupes de fusion pour les lieux dupliqués.
 *     description: La liste des identifiants de groupes de fusion pour les lieux dupliqués correspond aux identifiants assignés aux groupes des lieux fusionnés, à chaque ensemble de lieu fusionnés est associé un même identifiant de groupe.
 *     operationId: lieux-inclusion-numerique-merge-groups.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des identifiants de groupes de fusion pour les lieux dupliqués.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MergeGroup'
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2<MergeGroupTransfer[]>> =>
  pipe(
    fromTask(() =>
      scanPaginated<MergedLieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        paginationFromQueryString(qs.parse(toRawQueryString(event.queryStringParameters))),
        `${env.BASE_URL}${event.path}`,
        filter<MergedLieuInclusionNumeriqueStorage>(attributeExists('mergedIds'), attributeExists('group'))
      )
    ),
    map(toPaginatedMergeGroupTransferFormLieux),
    map(successResponse),
    map(noCacheResponse),
    getOrElse(toTask(failureResponse))
  )();
