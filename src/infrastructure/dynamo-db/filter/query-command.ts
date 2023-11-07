import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export type QueryCommandExpression = Omit<QueryCommandInput, 'TableName'>;

export type QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string> = Extract<keyof T, string>
>(
  field: TField,
  alias: string,
  value: Partial<T[TField]>
) => QueryCommandExpression;
