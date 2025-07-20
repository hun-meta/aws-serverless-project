import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { HealthCheckService } from './service/health-check.service';
import { HealthCheckRequestDto } from './dto/health-check-request.dto';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { ResponseHandler } from '@hun_meta/lambda-common';
import loggerService from './service/logger.service';

const CONTEXT = 'HealthCheckLambda';
const healthCheckService = HealthCheckService.getInstance();

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    loggerService.info(CONTEXT, 'Health check request received', {
      requestId: context.awsRequestId,
      httpMethod: event.httpMethod,
      path: event.path
    });

    // Parse request body
    const requestBody = event.body ? JSON.parse(event.body) : {};
    const requestDto = new HealthCheckRequestDto(requestBody.requestTimestamp);

    // Process health check
    const responseDto: HealthCheckResponseDto = await healthCheckService.healthCheck(requestDto);

    // Return success response
    const response = ResponseHandler.success(responseDto, 'Health check completed successfully');
    
    loggerService.info(CONTEXT, 'Health check completed', {
      requestId: context.awsRequestId,
      status: 'success',
      healthy: responseDto.isHealthy
    });

    return response;

  } catch (error: any) {
    loggerService.error(CONTEXT, 'Health check failed', {
      requestId: context.awsRequestId,
      error: error.message,
      stack: error.stack
    });

    return ResponseHandler.error(error, 'Health check failed');
  }
};