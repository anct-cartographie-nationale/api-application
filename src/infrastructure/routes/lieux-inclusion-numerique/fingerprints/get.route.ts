import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { pipe } from 'fp-ts/function';
import { fromTask, getOrElse, map } from 'fp-ts/TaskEither';
import { toTask } from '../../../../fp-helpers';
import { allFingerprintsBySourceIndex } from '../../../dynamo-db';
import { failureResponse, noCacheResponse, successResponse } from '../../../responses';
import { fromLieuxInclusionNumeriqueStorage, ReadFingerprintTransfer } from '../../../transfers';

/**
 * @openapi
 * /lieux-inclusion-numerique/fingerprints/{source}:
 *   get:
 *     summary: Récupérer la liste des empreintes numériques des lieux de médiation numérique.
 *     description: La liste des empreintes numériques des lieux d'inclusion numérique permet de déduire les modifications qui ont été opérées sur certains enregistrements depuis la dernière transformation.
 *     operationId: lieux-inclusion-numerique-fingerprints.get
 *     parameters:
 *       - in: path
 *         name: source
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom de la source de données à partir de laquelle récupérer la liste des empreintes numériques.
 *     security: []
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       200:
 *         description: La liste des empreintes numériques.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fingerprint'
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<ReadFingerprintTransfer[]>> => {
  const source: string | undefined = event.pathParameters?.['source'];

  if (source == null) {
    return {
      statusCode: 422,
      body: JSON.stringify({ message: 'Le paramètres "source" est obligatoire dans le chemin' })
    };
  }

  return pipe(
    fromTask(() => allFingerprintsBySourceIndex()(source)),
    map(fromLieuxInclusionNumeriqueStorage),
    map(successResponse),
    map(noCacheResponse),
    getOrElse(toTask(failureResponse))
  )();
};
