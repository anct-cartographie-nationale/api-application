import { Condition, ConditionNode } from '../abstract-syntax-tree';
import { Filter } from '../filter';
import { OperatorFilterExpression } from './operators';

export const notExistsFilterExpression: OperatorFilterExpression = (attribute: string): string =>
  `attribute_not_exists(${attribute})`;

export const attributeNotExists = <T, TAttribute extends keyof T = keyof T>(attribute: TAttribute): ConditionNode<Filter<T>> =>
  Condition({ attribute, comparison: 'notExists' });
