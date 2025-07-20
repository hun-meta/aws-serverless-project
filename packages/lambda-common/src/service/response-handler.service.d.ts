import { APIGatewayProxyResult } from 'aws-lambda';
export declare class ResponseHandler {
    static success<T>(data: T, message?: string): APIGatewayProxyResult;
    static error(error: any, message?: string): APIGatewayProxyResult;
    static notFound(message?: string): APIGatewayProxyResult;
    static badRequest(message?: string): APIGatewayProxyResult;
    static unauthorized(message?: string): APIGatewayProxyResult;
}
