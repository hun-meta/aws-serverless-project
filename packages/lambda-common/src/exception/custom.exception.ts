import { ResponseInfo } from '../interface/response.types';

export class CustomException extends Error {
    responseInfo: ResponseInfo;
    actionCode: string = '000';
    externalIdentifier: string = '0';
    externalCode: string = '000';
    serviceCode: string = '0';
    lambdaCode: string = '000';

    constructor(error: Error, responseInfo: ResponseInfo) {
        super(error.message);
        this.name = error.name;
        this.stack = error.stack;
        this.responseInfo = responseInfo;
        this.actionCode = responseInfo.returnCode;
    }

    public setExternalIdentifier(externalIdentifier: string) {
        this.externalIdentifier = externalIdentifier;
    }

    public setExternalCode(externalCode: string) {
        this.externalCode = externalCode;
    }

    public setServiceCode(serviceCode: string) {
        this.serviceCode = serviceCode;
    }

    public setLambdaCode(lambdaCode: string) {
        this.lambdaCode = lambdaCode;
    }

    public getResponseInfo(): ResponseInfo {
        return {
            status: this.responseInfo.status,
            returnCode: `${this.lambdaCode}${this.serviceCode}${this.externalIdentifier}${this.externalCode}${this.actionCode}`,
            message: this.responseInfo.message,
        };
    }
}