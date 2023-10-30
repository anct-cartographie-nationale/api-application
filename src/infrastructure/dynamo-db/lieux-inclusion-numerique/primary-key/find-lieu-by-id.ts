import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../../storage';
import { AttributeValue, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const findLieuById =
  (docClient: DynamoDBDocumentClient) =>
  async (id: string): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    unmarshall(
      (
        await docClient.send(
          new GetItemCommand({
            TableName: 'cartographie-nationale.lieux-inclusion-numerique',
            Key: { id: { S: id } }
          })
        )
      ).Item as AttributeValue | Record<string, AttributeValue>
    ) as LieuInclusionNumeriqueStorage | undefined;
