import { APIGatewayProxyResult } from 'aws-lambda';
import * as HttpStatus from '../constant/http-status.constant';

export class ResponseHandler {
  static success<T>(data: T, message: string = 'Success'): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.SUCCESS,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      })
    };
  }

  static error(error: any, message: string = 'Internal Server Error'): APIGatewayProxyResult {
    const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        message,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      })
    };
  }

  static notFound(message: string = 'Resource not found'): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message,
        timestamp: new Date().toISOString()
      })
    };
  }

  static badRequest(message: string = 'Bad request'): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message,
        timestamp: new Date().toISOString()
      })
    };
  }

  static unauthorized(message: string = 'Unauthorized'): APIGatewayProxyResult {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message,
        timestamp: new Date().toISOString()
      })
    };
  }
}