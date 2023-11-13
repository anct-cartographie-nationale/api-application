import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../../storage';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const findLieuById =
  (docClient: DynamoDBDocumentClient) =>
  async (id: string): Promise<LieuInclusionNumeriqueStorage | undefined> =>
    unmarshall(
      (
        await docClient.send(
          new GetCommand({
            TableName: 'cartographie-nationale.lieux-inclusion-numerique',
            Key: { id }
          })
        )
      ).Item as AttributeValue | Record<string, AttributeValue>
    ) as LieuInclusionNumeriqueStorage | undefined;
