import { QueryCommandExpression, QueryCommandOperator } from '../query-command';

export const attributeExistsOperator: QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string>,
  TValue = boolean
>(
  field: TField,
  alias: string,
  value: TValue
): QueryCommandExpression => ({
  ExpressionAttributeNames: { [`#${alias}`]: field },
  FilterExpression: value ? `attribute_exists(#${alias})` : `attribute_not_exists(#${alias})`
});
