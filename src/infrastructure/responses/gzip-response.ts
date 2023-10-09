import { gzipSync } from 'zlib';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export const gzipResponse = (
  response: APIGatewayProxyStructuredResultV2 & { body: string }
): APIGatewayProxyStructuredResultV2 => ({
  statusCode: response.statusCode,
  headers: {
    ...response.headers,
    'Content-Encoding': 'gzip',
    'Cache-Control': 'public, max-age=86400'
  },
  isBase64Encoded: true,
  body: gzipSync(response.body).toString('base64')
});
