import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBDocumentClient, PutCommand, PutCommandOutput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v5 as uuid } from 'uuid';
import {
  fromSchemaLieuxDeMediationNumerique,
  Id,
  LieuMediationNumerique,
  SchemaLieuMediationNumerique
} from '@gouvfr-anct/lieux-de-mediation-numerique';
import { successResponse } from '../../responses';
import { LieuxInclusionNumeriqueTransfer } from '../../transfers';
import { LieuInclusionNumeriqueStorage, reassignId, toISOStringDateMaj } from '../../storage';

const findLieuxBySourceIndex =
  (docClient: DynamoDBDocumentClient) =>
  async (source: string, id: string): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    (
      await docClient.send(
        new QueryCommand({
          TableName: 'cartographie-nationale.lieux-inclusion-numerique',
          IndexName: 'source-index',
          ExpressionAttributeNames: {
            '#source': 'source',
            '#sourceId': 'sourceId'
          },
          ExpressionAttributeValues: {
            ':source': source,
            ':sourceId': id
          },
          KeyConditionExpression: '#source = :source and #sourceId = :sourceId'
        })
      )
    ).Items?.[0] as LieuInclusionNumeriqueStorage | undefined;

const upsertLieu =
  (docClient: DynamoDBDocumentClient) =>
  (lieuInclusionNumerique: LieuInclusionNumeriqueStorage, lieuInclusionNumeriqueFound?: LieuInclusionNumeriqueStorage) =>
    docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: reassignId(
          lieuInclusionNumerique,
          Id(
            lieuInclusionNumeriqueFound == undefined
              ? uuid(lieuInclusionNumerique.source ?? 'EMPTY_SOURCE', lieuInclusionNumerique.id)
              : lieuInclusionNumeriqueFound.id
          )
        )
      })
    );

/**
 * @openapi
 * /lieux-inclusion-numerique:
 *   patch:
 *     summary: Mettre à jour la collection des lieux d'inclusion numérique en ajoutant ou modifiant une série d'éléments.
 *     description: La mise à jour de la collection des lieux d'inclusion numérique se produit en ajoutant de nouveaux éléments ou en modifiant ceux qui sont déjà présents à partir de l'ensemble des lieux d'inclusion numérique fournis.
 *     operationId: lieux-inclusion-numerique.patch
 *     security:
 *       - ApiKeyAuthorization: []
 *     requestBody:
 *       description: Lieux d'inclusion numérique à ajouter ou modifier
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/LieuInclusionNumerique'
 *     responses:
 *       400:
 *         description: Erreur par défaut.
 *       422:
 *         description: Le format des données fournies dans le body doit correspondre à un tableau de lieux de médiation numérique valide.
 *       200:
 *         description: Les lieux d'inclusion numérique à ajouter ou à modifier ont étés traités avec succès.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const lieuxInclusionNumerique: LieuxInclusionNumeriqueTransfer[] =
    (event.body as SchemaLieuMediationNumerique[] | undefined) ?? [];
  const client: DynamoDBClient = new DynamoDBClient();
  const docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { convertClassInstanceToMap: true }
  });

  try {
    await Promise.all(
      fromSchemaLieuxDeMediationNumerique(lieuxInclusionNumerique).map(
        async (lieuInclusionNumerique: LieuMediationNumerique): Promise<PutCommandOutput> => {
          const source: string = lieuInclusionNumerique.source ?? 'EMPTY_SOURCE';
          const id: string = lieuInclusionNumerique.id;

          const lieuInclusionNumeriqueFound: LieuInclusionNumeriqueStorage | undefined = await findLieuxBySourceIndex(
            docClient
          )(source, id);

          return upsertLieu(docClient)(toISOStringDateMaj(lieuInclusionNumerique), lieuInclusionNumeriqueFound);
        }
      )
    );

    return successResponse({
      message: "Les lieux d'inclusion numérique à ajouter ou à modifier ont étés traités avec succès."
    });
  } catch {
    return {
      statusCode: 422,
      body: JSON.stringify({
        message:
          'Le format des données fournies dans le body doit correspondre à un tableau de lieux de médiation numérique valide.'
      })
    };
  }
};
