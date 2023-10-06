import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';

export const failureResponse = (): APIGatewayProxyStructuredResultV2 => ({
  statusCode: 500
});
