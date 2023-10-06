import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export const noCacheResponse = (response: APIGatewayProxyStructuredResultV2): APIGatewayProxyStructuredResultV2 => ({
  ...response,
  headers: { ...response.headers, 'Cache-Control': 'no-cache' }
});
