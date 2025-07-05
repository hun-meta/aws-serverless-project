/**
 * 외부 시스템 식별자 (1자리)
 */
export const EXTERNAL_IDENTIFIER = {
    NONE: '0',
    DATABASE: '1',
    S3: '2',
    DynamoDB: '3',
} as const;
  
/**
 * 모든 서비스에서 공통으로 사용할 수 있는 액션 코드 (3자리)
 */
export const COMMON_ACTION_CODES = {
    SUCCESS: '0',
    NOT_FOUND: '001',
    INVALID_INPUT: '002',
    UNAUTHORIZED: '003',
    FORBIDDEN: '004',
    CONFLICT: '005', // e.g., 중복된 리소스 생성 시도
    INTERNAL_SERVER_ERROR: '998',
    UNDEFINED: '999',
} as const;