import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../storage';

export const allFingerprintsBySourceIndex =
  (docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())) =>
  async (source: string): Promise<LieuInclusionNumeriqueStorage[]> =>
    (
      await docClient.send(
        new QueryCommand({
          TableName: 'cartographie-nationale.lieux-inclusion-numerique',
          IndexName: 'source-index',
          ExpressionAttributeNames: { '#source': 'source' },
          ExpressionAttributeValues: { ':source': source },
          KeyConditionExpression: '#source = :source'
        })
      )
    ).Items as LieuInclusionNumeriqueStorage[];
