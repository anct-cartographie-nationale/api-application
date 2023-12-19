import { describe, expect, it } from 'vitest';
import { QueryCommandExpression } from './filter';
import { queryStringFilter } from './query-string.filter';

describe('filter configuration for dynamodb scan command', (): void => {
  it('should generate filter from JSON:API query string with eq from query string', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[eq]=Angers');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source' },
      ExpressionAttributeValues: { ':00': 'Angers' },
      FilterExpression: '#00 = :00'
    });
  });

  it('should generate filter from JSON:API query string two filtered attributes from query string', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[eq]=Angers&deduplicated[exists]=false');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source', '#1': 'deduplicated' },
      ExpressionAttributeValues: { ':0': 'Angers' },
      FilterExpression: '#0 = :0 and attribute_not_exists(#1)'
    });
  });

  it('should generate filter from JSON:API query string with exists from query string set to false', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[exists]=false');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source' },
      FilterExpression: `attribute_not_exists(#00)`
    });
  });

  it('should generate filter from JSON:API query with exists from query string set to true string', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[exists]=true');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source' },
      FilterExpression: `attribute_exists(#00)`
    });
  });

  it('should generate filter from JSON:API query string for one attribute with two filters from query string', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[exists]=true&source[beginsWith]=A');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source', '#1': 'source' },
      ExpressionAttributeValues: { ':1': 'A' },
      FilterExpression: 'attribute_exists(#0) and begins_with(#1, :1)'
    });
  });

  it('should generate filter from JSON:API query string with or between multiple source', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter(
      'or[source][eq]=Angers&or[source][eq]=Hinaura&or[source][eq]=Francil-in'
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#01': 'source', '#02': 'source' },
      ExpressionAttributeValues: { ':00': 'Angers', ':01': 'Hinaura', ':02': 'Francil-in' },
      FilterExpression: '#00 = :00 or #01 = :01 or #02 = :02'
    });
  });

  it('should generate filter from JSON:API query string with or between multiple a nested adresse code_insee with indexes', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter(
      'or[adresse][beginsWith][0][code_insee]=49&or[adresse][beginsWith][1][code_insee]=38'
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'adresse', '#01': 'adresse' },
      ExpressionAttributeValues: { ':000': '49', ':010': '38' },
      FilterExpression: 'begins_with(#00.code_insee, :000) or begins_with(#01.code_insee, :010)'
    });
  });

  it('should generate filter from JSON:API query string with or between multiple a nested adresse code_insee', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter(
      'or[adresse][beginsWith][code_insee]=49&or[adresse][beginsWith][code_insee]=38'
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'adresse', '#01': 'adresse' },
      ExpressionAttributeValues: { ':000': '49', ':010': '38' },
      FilterExpression: 'begins_with(#00.code_insee, :000) or begins_with(#01.code_insee, :010)'
    });
  });

  it('should generate filter from JSON:API query string for one attribute with a nested object filter', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('adresse[beginsWith][code_insee]=49,38');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'adresse', '#01': 'adresse' },
      ExpressionAttributeValues: { ':000': '49', ':010': '38' },
      FilterExpression: 'begins_with(#00.code_insee, :000) or begins_with(#01.code_insee, :010)'
    });
  });

  it('should generate filter from JSON:API query string for one attribute with a nested object filter and a default filter', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter(
      'and[or][mergedIds][exists]=true&and[or][group][exists]=false&adresse[beginsWith][code_insee]=49,38'
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: {
        '#000': 'mergedIds',
        '#001': 'group',
        '#100': 'adresse',
        '#101': 'adresse'
      },
      ExpressionAttributeValues: {
        ':1000': '49',
        ':1010': '38'
      },
      FilterExpression:
        '(attribute_exists(#000) or attribute_not_exists(#001)) and (begins_with(#100.code_insee, :1000) or begins_with(#101.code_insee, :1010))'
    });
  });

  it('should generate filter from JSON:API query string for one attribute with one filter and multiple values from query string', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('source[beginsWith]=A,B,C');

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#01': 'source', '#02': 'source' },
      ExpressionAttributeValues: { ':00': 'A', ':01': 'B', ':02': 'C' },
      FilterExpression: 'begins_with(#00, :00) or begins_with(#01, :01) or begins_with(#02, :02)'
    });
  });

  it('should generate filter from JSON:API query string with multiple nested conditions', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter(
      `or[0][and][0][deduplicated][exists]=true&or[0][and][1][source][eq]=Angers&or[1][and][0][publics_accueillis][exists]=true&or[1][and][0][conditions_acces][exists]=true&or[1][and][0][labels_nationaux][exists]=true&or[1][or][0][source][beginsWith]=A&or[1][or][1][source][beginsWith]=B`
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: {
        '#000': 'deduplicated',
        '#001': 'source',
        '#0100': 'publics_accueillis',
        '#0101': 'conditions_acces',
        '#0102': 'labels_nationaux',
        '#0110': 'source',
        '#0111': 'source'
      },
      FilterExpression:
        '(attribute_exists(#000) and #001 = :001) or (((attribute_exists(#0100) and attribute_exists(#0101)) and attribute_exists(#0102)) and (begins_with(#0110, :0110) or begins_with(#0111, :0111)))',
      ExpressionAttributeValues: { ':001': 'Angers', ':0110': 'A', ':0111': 'B' }
    });
  });

  it('should ignore filters without operators', (): void => {
    const queryCommandExpression: QueryCommandExpression = queryStringFilter('cache=false');

    expect(queryCommandExpression).toStrictEqual({});
  });
});
