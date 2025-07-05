import { ResponseInfo } from "../interface/response.types";
import { COMMON_ACTION_CODES } from "./common-code.constant";
import { CREATED, SUCCESS } from "./http-status.constant";

export const SUCCESS_INFO: ResponseInfo = {
    status: SUCCESS,
    returnCode: COMMON_ACTION_CODES.SUCCESS,
    message: 'Request Success',
}

export const CREATED_INFO: ResponseInfo = {
    status: CREATED,
    returnCode: COMMON_ACTION_CODES.SUCCESS,
    message: 'Data Created',
}