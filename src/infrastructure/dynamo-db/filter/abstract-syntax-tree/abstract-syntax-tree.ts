export type ConditionNode<T> = { condition: T };

export type Operator = 'and' | 'or';

type ConditionalNestedJsonLeaf<T> = Partial<{ [key in Operator]: T[] }>;

type ConditionalNestedJsonNode<T> = Partial<{ [key in Operator]: ConditionalNestedJson<T>[] }>;

export type ConditionalNestedJson<T> = ConditionalNestedJsonLeaf<T> | ConditionalNestedJsonNode<T>;

export const Condition = <T>(condition: T): ConditionNode<T> => ({ condition });

export type OperatorNode<T> = { operator: Operator; children: QueryNode<T>[] };

export type QueryNode<T> = ConditionNode<T> | OperatorNode<T>;

export const isOperatorNode = <T extends object>(element: T | QueryNode<T>): element is OperatorNode<T> =>
  Object.keys(element).includes('children') && Object.keys(element).includes('operator');

const renderChildrenIn = <T extends object>({ operator, children }: OperatorNode<T>): string =>
  children.map((node: QueryNode<T>) => renderConditionalQueryExpression(node, false)).join(` ${operator} `);

const renderNode = <T extends object>(node: OperatorNode<T>, isRoot: boolean): string =>
  isRoot ? renderChildrenIn(node) : `(${renderChildrenIn(node)})`;

export const renderConditionalQueryExpression = <T extends object>(node: QueryNode<T>, isRoot: boolean = true): string => {
  if (Array.isArray(node))
    return node.map((childNode: QueryNode<T>): string => renderConditionalQueryExpression(childNode)).join(', ');
  if (isOperatorNode(node)) return renderNode(node, isRoot);
  return node.condition.toString();
};

export const and = <T>(...children: QueryNode<T>[]): OperatorNode<T> => ({ operator: 'and', children });

export const or = <T>(...children: QueryNode<T>[]): OperatorNode<T> => ({ operator: 'or', children });

export const isConditionalNestedJsonLeaf = <T extends object>(
  conditionalNestedJson: ConditionalNestedJson<T> | T
): conditionalNestedJson is T =>
  !Object.keys(conditionalNestedJson).includes('and') && !Object.keys(conditionalNestedJson).includes('or');

const toConditionalNestedJsonArray = <T>(node: ConditionalNestedJson<T>[]): ConditionalNestedJson<T>[] =>
  Array.isArray(node) ? node : [node];

// eslint-disable-next-line @typescript-eslint/ban-types
type Transformer = Function;

const isOperator = (operator: string): operator is Operator => operator === 'and' || operator === 'or';

const toASTOperator =
  <T extends object>(leafTransformer: Transformer) =>
  (operators: string[], conditionalNestedJsonNode: Record<string, ConditionalNestedJson<T>[] | T[]>): QueryNode<T>[] =>
    operators.map((operator: string): OperatorNode<T> => {
      const item: ConditionalNestedJson<T>[] | T[] = conditionalNestedJsonNode[operator]!;
      return isOperator(operator)
        ? { operator, children: [...toConditionalNestedJsonArray(item).flatMap(nestedJsonToAST<T>(leafTransformer))] }
        : or(...toConditionalNestedJsonArray([{ or: [{ [operator]: item }] }]).flatMap(nestedJsonToAST<T>(leafTransformer)));
    });

const hasBothOperators = (operators: string[]): boolean => operators.includes('or') && operators.includes('and');

const withExtraAndFor = <T>(conditionalNestedJson: ConditionalNestedJsonNode<T>): ConditionalNestedJson<T> => ({
  and: [{ and: conditionalNestedJson.and! }, { or: conditionalNestedJson.or! }]
});

const nextConditionalNestedJsonNode =
  <T extends object>(conditionalNestedJson: Record<string, ConditionalNestedJson<T>[] | T[]>, operators: string[]) =>
  (leafTransformer: Transformer): QueryNode<T> | QueryNode<T>[] =>
    hasBothOperators(operators)
      ? nestedJsonToAST<T>(leafTransformer)(withExtraAndFor(conditionalNestedJson))
      : toASTOperator<T>(leafTransformer)(operators, conditionalNestedJson);

const doNotTransformLeavesOf = <T>(leaf: T): T[] => [leaf];

export const nestedJsonToAST =
  <T extends object>(leafTransformer: Transformer = doNotTransformLeavesOf) =>
  (conditionalNestedJson: ConditionalNestedJson<T>): QueryNode<T>[] =>
    isConditionalNestedJsonLeaf(conditionalNestedJson)
      ? leafTransformer(conditionalNestedJson).map(Condition)
      : nextConditionalNestedJsonNode(
          conditionalNestedJson,
          Object.keys(conditionalNestedJson) as [Partial<Operator>]
        )(leafTransformer);
