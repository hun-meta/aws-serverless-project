import { BaseService } from "@hun_meta/lambda-common";
import { HealthCheckRequestDto } from "../dto/health-check-request.dto";
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';
export declare class HealthCheckService extends BaseService {
    private static instance;
    constructor();
    static getInstance(): HealthCheckService;
    /**
     * Health Check 요청 처리 메서드
     * @param healthCheckResponseDto - 요청 데이터
     * @returns 응답 데이터
     */
    healthCheck(healthCheckResponseDto: HealthCheckRequestDto): Promise<HealthCheckResponseDto>;
    private getHealthCheckTime;
}
