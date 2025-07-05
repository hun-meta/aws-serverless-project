/**
 * Health Check Service 에서 사용하는 요청 DTO 클래스 정의 파일
 */

import { IsNumber, IsOptional } from "class-validator";

/**
 * Health Check 요청 DTO
 */
export class HealthCheckRequestDto {
    
    @IsOptional()
    @IsNumber()
    requestTimestamp: number = Date.now();
}