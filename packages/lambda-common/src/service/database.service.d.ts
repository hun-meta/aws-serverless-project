import { BaseExternalService } from "./base-external.service";
/**
 * 데이터베이스 관련 외부 서비스 추상 클래스
 * 각 테이블별 서비스는 이 클래스를 상속받아 구현합니다.
 */
export declare abstract class DatabaseService extends BaseExternalService {
    protected constructor(tableCode: string);
}
/**
 * 예시 테이블 서비스 클래스
 */
export declare class ExampleTableService extends DatabaseService {
    private static instance;
    constructor();
    static getInstance(): ExampleTableService;
}
