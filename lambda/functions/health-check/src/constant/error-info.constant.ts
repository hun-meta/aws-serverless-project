import { COMMON_ACTION_CODES, ResponseInfo, NOT_FOUND } from '@hun_meta/lambda-common';




export const DATE_NOT_FOUND: ResponseInfo = {
    status: NOT_FOUND,
    returnCode: COMMON_ACTION_CODES.NOT_FOUND,
    message: 'Input Date Not Found',
}