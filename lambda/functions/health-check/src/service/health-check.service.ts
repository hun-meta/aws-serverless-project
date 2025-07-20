import { BaseService } from "@hun_meta/lambda-common";
import { HEALTH_CHECK_LAMBDA_SERVICE_CODE } from "../constant/service-code.constant";
import { HealthCheckRequestDto } from "../dto/health-check-request.dto";
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';
import loggerService from "./logger.service";

const CONTEXT = 'HealthCheckService';

export class HealthCheckService extends BaseService {
    private static instance: HealthCheckService;

    public constructor() {
        super(CONTEXT, HEALTH_CHECK_LAMBDA_SERVICE_CODE.HEALTH_CHECK_SERVICE, loggerService);
    }

    public static getInstance(): HealthCheckService {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }

    /**
     * Health Check 요청 처리 메서드
     * @param healthCheckResponseDto - 요청 데이터
     * @returns 응답 데이터
     */
    public async healthCheck(healthCheckResponseDto: HealthCheckRequestDto): Promise<HealthCheckResponseDto> {
        const { requestTimestamp } = healthCheckResponseDto;

        const healthCheckTime = this.getHealthCheckTime();
        
        return new HealthCheckResponseDto(true, healthCheckTime, requestTimestamp || Date.now());
    }

    private getHealthCheckTime(): string {
        try{
            const healthCheckTime = new Date().toISOString();
            this.logger.info(this.CONTEXT, 'Health Check Time', healthCheckTime);

            return healthCheckTime;
        }catch(error: any){
            return this.buildError(error);
        }
    }
}