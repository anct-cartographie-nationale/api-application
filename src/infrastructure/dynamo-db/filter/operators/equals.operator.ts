import { QueryCommandExpression, QueryCommandOperator } from '../query-command';

export const equalsOperator: QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string> = Extract<keyof T, string>
>(
  field: TField,
  alias: string,
  value: Partial<T[TField]>
): QueryCommandExpression => ({
  ExpressionAttributeNames: { [`#${alias}`]: field },
  ExpressionAttributeValues: { [`:${alias}`]: value },
  FilterExpression: `#${alias} = :${alias}`
});

export const equals = <TValue>(value: TValue): { value: TValue; operator: QueryCommandOperator } => ({
  value,
  operator: equalsOperator
});
