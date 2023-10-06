import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../fp-helpers';
import { scanAll } from '../../dynamo-db';
import { failureResponse, noCacheResponse, successResponse } from '../../responses';
import { SourceTransfer } from '../../transfers';

/**
 * @openapi
 * /sources:
 *   get:
 *     summary: Récupérer la liste des sources de données.
 *     description: La liste des sources de données contient les informations à propos des différentes sources utilisés pour constituer la liste des lieux de médiation numérique.
 *     operationId: sources.get
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des sources de données.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Source'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2<SourceTransfer>> =>
  pipe(
    fromTask(() => scanAll('cartographie-nationale.sources')),
    map(successResponse),
    map(noCacheResponse),
    getOrElse(toTask(failureResponse))
  )();
