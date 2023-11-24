import { DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommandExpression } from './filter';
import { Page, Paginated, Pagination } from './pagination';

export const scanPaginated = async <T>(
  TableName: string,
  pagination: Pagination,
  url: string,
  filter: QueryCommandExpression = {},
  docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())
): Promise<Paginated<T>> => {
  const elements: T[] = [];
  let result: T[] = [];
  let ExclusiveStartKey: Record<string, T> | undefined;
  let totalPages: number = 0;

  do {
    const scanCommand: ScanCommand = new ScanCommand({
      TableName,
      ...filter,
      ...(ExclusiveStartKey ? { ExclusiveStartKey } : {}),
      Limit: pagination.size
    });
    const { Items, LastEvaluatedKey }: ScanCommandOutput = await docClient.send(scanCommand);
    result = (Items ?? []) as T[];
    elements.push(...result);
    ExclusiveStartKey = LastEvaluatedKey;
    totalPages++;
  } while (ExclusiveStartKey);

  return Paginated(Page({ totalElements: elements.length, totalPages, ...pagination }), url)(result);
};
