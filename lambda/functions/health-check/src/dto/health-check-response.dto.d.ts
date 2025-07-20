/**
 * Health Check Service 에서 사용하는 응답 DTO 클래스 정의 파일
 */
/**
 * Health Check 요청 응답 DTO
 */
export declare class HealthCheckResponseDto {
    isHealthy: boolean;
    healthCheckTime: string;
    requestTimestamp: number;
    constructor(isHealthy: boolean, healthCheckTime: string, requestTimestamp: number);
}
