import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommandExpression } from './filter';

export const scanAll = async <T>(
  TableName: string,
  filter: QueryCommandExpression = {},
  docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())
): Promise<T[]> => {
  const result: T[] = [];
  let ExclusiveStartKey: Record<string, T> | undefined;

  do {
    const scanCommand: ScanCommand = new ScanCommand({
      TableName,
      ...filter,
      ...(ExclusiveStartKey ? { ExclusiveStartKey } : {})
    });
    const { Items, LastEvaluatedKey }: ScanCommandOutput = await docClient.send(scanCommand);
    result.push(...((Items ?? []) as T[]));
    ExclusiveStartKey = LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return result;
};
