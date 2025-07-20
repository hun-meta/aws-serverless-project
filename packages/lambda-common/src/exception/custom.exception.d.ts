import { ResponseInfo } from '../interface/response.types';
export declare class CustomException extends Error {
    responseInfo: ResponseInfo;
    actionCode: string;
    externalIdentifier: string;
    externalCode: string;
    serviceCode: string;
    lambdaCode: string;
    constructor(error: Error, responseInfo: ResponseInfo);
    setExternalIdentifier(externalIdentifier: string): void;
    setExternalCode(externalCode: string): void;
    setServiceCode(serviceCode: string): void;
    setLambdaCode(lambdaCode: string): void;
    getResponseInfo(): ResponseInfo;
}
