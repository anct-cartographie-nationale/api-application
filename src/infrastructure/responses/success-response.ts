import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const successResponse = <T>(body: T): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});
