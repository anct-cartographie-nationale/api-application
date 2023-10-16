import { DynamoDBDocumentClient, QueryCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../../storage';

export const allFingerprintsBySourceIndex =
  (docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())) =>
  async (source: string): Promise<LieuInclusionNumeriqueStorage[]> => {
    const allResponses: LieuInclusionNumeriqueStorage[] = [];
    let ExclusiveStartKey: Record<string, LieuInclusionNumeriqueStorage> | undefined;

    do {
      const queryCommand: QueryCommand = new QueryCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        IndexName: 'source-index',
        ExpressionAttributeNames: { '#source': 'source' },
        ExpressionAttributeValues: { ':source': source },
        KeyConditionExpression: '#source = :source'
      });

      const dynamoDBResponse: ScanCommandOutput = await docClient.send(queryCommand);
      allResponses.push(...((dynamoDBResponse.Items ?? []) as LieuInclusionNumeriqueStorage[]));
      ExclusiveStartKey = dynamoDBResponse.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return allResponses;
  };
