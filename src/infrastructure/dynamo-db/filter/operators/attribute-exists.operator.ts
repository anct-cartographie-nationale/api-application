import { Condition, ConditionNode } from '../abstract-syntax-tree';
import { Filter } from '../filter';
import { OperatorFilterExpression } from './operators';

export const existsFilterExpression: OperatorFilterExpression = (attribute: string): string => `attribute_exists(${attribute})`;

export const attributeExists = <T, TAttribute extends keyof T = keyof T>(attribute: TAttribute): ConditionNode<Filter<T>> =>
  Condition({ attribute, comparison: 'exists' });
