import { QueryCommandExpression, QueryCommandOperator } from '../query-command';

export const attributeNotExistsOperator: QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string> = Extract<keyof T, string>
>(
  field: TField,
  alias: string
): QueryCommandExpression => ({
  ExpressionAttributeNames: { [`#${alias}`]: field },
  FilterExpression: `attribute_not_exists(#${alias})`
});
