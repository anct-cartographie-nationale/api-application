import { QueryCommandOperator } from '../query-command';
import { equalsOperator } from './equals.operator';
import { beginWithOperator } from './begin-with.operator';

export type OperatorAlias = (typeof OperatorAliases)[number];
export const OperatorAliases: string[] = ['eq', 'startswith'];

export const OPERATORS: Record<OperatorAlias, QueryCommandOperator> = {
  startswith: beginWithOperator,
  eq: equalsOperator
};

export type QueryFilter<T> = Record<string, Record<OperatorAlias, Partial<T>>>;
