import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy';

const mergeQueryStringParameter = (key: string, value?: string): string => (value == null ? key : `${key}=${value}`);

const toQueryStringFrom =
  (queryStringParameters: APIGatewayProxyEventQueryStringParameters) =>
  (queryString: string, key: string): string =>
    queryString === ''
      ? mergeQueryStringParameter(key, queryStringParameters[key])
      : [queryString, mergeQueryStringParameter(key, queryStringParameters[key])].join('&');

export const toRawQueryString = (queryStringParameters?: APIGatewayProxyEventQueryStringParameters): string =>
  queryStringParameters == null ? '' : Object.keys(queryStringParameters).reduce(toQueryStringFrom(queryStringParameters), '');
