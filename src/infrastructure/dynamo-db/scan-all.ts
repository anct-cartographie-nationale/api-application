import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommandExpression } from './filter/query-command';

export const scanAll = async <T>(
  TableName: string,
  filter: QueryCommandExpression = {},
  docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())
): Promise<T[]> => {
  const allResponses: T[] = [];
  let ExclusiveStartKey: Record<string, T> | undefined;

  do {
    const scanCommand: ScanCommand = new ScanCommand({
      TableName,
      ...filter,
      ...(ExclusiveStartKey ? { ExclusiveStartKey } : {})
    });
    const dynamoDBResponse: ScanCommandOutput = await docClient.send(scanCommand);
    allResponses.push(...((dynamoDBResponse.Items ?? []) as T[]));
    ExclusiveStartKey = dynamoDBResponse.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return allResponses;
};
