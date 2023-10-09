import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export const successResponse = <T>(body: T): APIGatewayProxyStructuredResultV2 & { body: string } => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});
