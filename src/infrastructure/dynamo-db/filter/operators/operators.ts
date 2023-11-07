import { QueryCommandOperator } from '../query-command';
import { equalsOperator } from './equals.operator';
import { beginWithOperator } from './begin-with.operator';
import { attributeExistsOperator } from './attribute-exists.operator';

export type OperatorAlias = (typeof OperatorAliases)[number];
export const OperatorAliases: string[] = ['eq', 'exists', 'startswith'];

export const OPERATORS: Record<OperatorAlias, QueryCommandOperator> = {
  exists: attributeExistsOperator,
  startswith: beginWithOperator,
  eq: equalsOperator
};

export type QueryFilter<T> = Record<string, Record<OperatorAlias, Partial<T>>>;
