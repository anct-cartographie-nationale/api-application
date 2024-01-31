import { equalFilterExpression } from './equals.operator';
import { existsFilterExpression } from './attribute-exists.operator';
import { notExistsFilterExpression } from './attribute-not-exists.operator';
import { beginsWithFilterExpression } from './begin-with.operator';
import { notEqualFilterExpression } from './not-equals.operator';

export type OperatorFilterExpression = (left: string, right: string) => string;

export type Comparison = 'eq' | 'neq' | 'exists' | 'notExists' | 'beginsWith';

export type OperatorWithValue<T, TAttribute extends keyof T = keyof T> = {
  comparison: Comparison;
  value?: Partial<T[TAttribute]>;
};

export const operatorFilterExpression: Record<Comparison, OperatorFilterExpression> = {
  eq: equalFilterExpression,
  neq: notEqualFilterExpression,
  exists: existsFilterExpression,
  notExists: notExistsFilterExpression,
  beginsWith: beginsWithFilterExpression
};
