/**
 * 외부 시스템 식별자 (1자리)
 */
export declare const EXTERNAL_IDENTIFIER: {
    readonly NONE: "0";
    readonly DATABASE: "1";
    readonly S3: "2";
    readonly DynamoDB: "3";
};
/**
 * 모든 서비스에서 공통으로 사용할 수 있는 액션 코드 (3자리)
 */
export declare const COMMON_ACTION_CODES: {
    readonly SUCCESS: "0";
    readonly NOT_FOUND: "001";
    readonly INVALID_INPUT: "002";
    readonly UNAUTHORIZED: "003";
    readonly FORBIDDEN: "004";
    readonly CONFLICT: "005";
    readonly INTERNAL_SERVER_ERROR: "998";
    readonly UNDEFINED: "999";
};
