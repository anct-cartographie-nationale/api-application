import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../../storage';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';

export const findLieuById =
  (docClient: DynamoDBDocumentClient) =>
  async (id: string): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    (
      await docClient.send(
        new GetItemCommand({
          TableName: 'cartographie-nationale.lieux-inclusion-numerique',
          Key: { id: { S: id } }
        })
      )
    ).Item as LieuInclusionNumeriqueStorage | undefined;
