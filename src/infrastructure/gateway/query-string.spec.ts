import { describe, expect, it } from 'vitest';
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy';
import { toRawQueryString } from './query-string';

describe('query string', (): void => {
  it('should retrieve empty query string form undefined query string parameters', (): void => {
    const queryString: string = toRawQueryString();

    expect(queryString).toBe('');
  });

  it('should retrieve raw query string form separated query string parameters', (): void => {
    const queryStringParameters: APIGatewayProxyEventQueryStringParameters = {
      'source[eq]': 'Angers',
      'adresse[startwith][code_insee]': '49'
    };

    const queryString: string = toRawQueryString(queryStringParameters);

    expect(queryString).toBe('source[eq]=Angers&adresse[startwith][code_insee]=49');
  });

  it('should retrieve raw query string for a parameter with no value', (): void => {
    const queryStringParameters: APIGatewayProxyEventQueryStringParameters = {
      'source[eq]': 'Angers',
      deduplicated: undefined
    };

    const queryString: string = toRawQueryString(queryStringParameters);

    expect(queryString).toBe('source[eq]=Angers&deduplicated');
  });
});
