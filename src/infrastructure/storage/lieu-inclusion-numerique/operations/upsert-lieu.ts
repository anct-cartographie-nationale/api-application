import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';
import { reassignId } from '../../reassign-id/reassign-id';
import { Id } from '@gouvfr-anct/lieux-de-mediation-numerique';

export const idForLieu = (lieu: LieuInclusionNumeriqueStorage): Id =>
  lieu.mergedIds == null ? Id(`${lieu.source}@${lieu.id}`) : Id(lieu.id);

export const upsertLieu =
  (docClient: DynamoDBDocumentClient) =>
  (lieuInclusionNumerique: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: reassignId(lieuInclusionNumerique, idForLieu(lieuInclusionNumerique))
      })
    );
