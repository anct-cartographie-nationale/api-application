import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { gzipSync } from 'zlib';

export const gzipedSuccessResponse = <T>(body: T): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Content-Encoding': 'gzip'
  },
  isBase64Encoded: true,
  body: gzipSync(JSON.stringify(body)).toString('base64')
});
