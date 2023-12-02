import { equalFilterExpression } from './equals.operator';
import { existsFilterExpression } from './attribute-exists.operator';
import { notExistsFilterExpression } from './attribute-not-exists.operator';
import { beginsWithFilterExpression } from './begin-with.operator';

export type OperatorFilterExpression = (left: string, right: string) => string;

export type Comparison = 'eq' | 'exists' | 'notExists' | 'beginsWith';

export type OperatorWithValue<T, TAttribute extends keyof T = keyof T> = {
  comparison: Comparison;
  value?: Partial<T[TAttribute]>;
};

export const operatorFilterExpression: Record<Comparison, OperatorFilterExpression> = {
  eq: equalFilterExpression,
  exists: existsFilterExpression,
  notExists: notExistsFilterExpression,
  beginsWith: beginsWithFilterExpression
};
