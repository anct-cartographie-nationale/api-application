import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const successResponse = <T>(body: T): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400'
  },
  isBase64Encoded: true,
  body: JSON.stringify(body)
});
