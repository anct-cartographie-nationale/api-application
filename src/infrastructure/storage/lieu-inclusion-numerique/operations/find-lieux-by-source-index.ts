import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';

export const findLieuxBySourceIndex =
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
