import { ResponseInfo } from "../interface/response.types";
import { COMMON_ACTION_CODES } from "./common-code.constant";
import { INTERNAL_SERVER_ERROR } from "./http-status.constant";

export const UNDEFINED_ERROR: ResponseInfo = {
    status: INTERNAL_SERVER_ERROR,
    returnCode: COMMON_ACTION_CODES.UNDEFINED,
    message: 'Undefined Error',
}