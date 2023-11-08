import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../../fp-helpers';
import { attributeExists, filter, scanAll } from '../../../dynamo-db';
import { MergedLieuInclusionNumeriqueStorage } from '../../../storage';
import { MergeGroupTransfer, mergeGroupTransferFormLieux } from '../../../transfers';
import { failureResponse, successResponse } from '../../../responses';

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
export const handler = async (): Promise<APIGatewayProxyResultV2<MergeGroupTransfer[]>> =>
  pipe(
    fromTask(() =>
      scanAll<MergedLieuInclusionNumeriqueStorage>(
        'cartographie-nationale.lieux-inclusion-numerique',
        filter<MergedLieuInclusionNumeriqueStorage>(attributeExists('mergedIds'), attributeExists('group'))
      )
    ),
    map(mergeGroupTransferFormLieux),
    map(successResponse),
    getOrElse(toTask(failureResponse))
  )();
