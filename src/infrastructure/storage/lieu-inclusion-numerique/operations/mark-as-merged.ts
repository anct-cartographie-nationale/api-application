import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';

export const markAsMerged =
  (docClient: DynamoDBDocumentClient) =>
  (lieuInclusionNumerique: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: { ...lieuInclusionNumerique, merged: true }
      })
    );
