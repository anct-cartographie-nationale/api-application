import { DynamoDBDocumentClient, PutCommand, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';

export const markAsDeduplicated =
  (docClient: DynamoDBDocumentClient) =>
  (lieuInclusionNumerique: LieuInclusionNumeriqueStorage): Promise<PutCommandOutput> =>
    docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: { ...lieuInclusionNumerique, deduplicated: true }
      })
    );
