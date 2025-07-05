import { EXTERNAL_IDENTIFIER } from "../constant/common-code.constant";
import { TABLE_CODES } from "../constant/table-code.constant";
import { BaseExternalService } from "./base-external.service";

/**
 * 데이터베이스 관련 외부 서비스 추상 클래스
 * 각 테이블별 서비스는 이 클래스를 상속받아 구현합니다.
 */
export abstract class DatabaseService extends BaseExternalService {
    protected constructor(tableCode: string) {
        super(EXTERNAL_IDENTIFIER.DATABASE, tableCode);
    }
}

/**
 * 예시 테이블 서비스 클래스
 */
export class ExampleTableService extends DatabaseService {
    private static instance: ExampleTableService;

    public constructor() {
        super(TABLE_CODES.EXAMPLE_TABLE);
    }

    public static getInstance(): ExampleTableService {
        if (!ExampleTableService.instance) {
            ExampleTableService.instance = new ExampleTableService();
        }
        return ExampleTableService.instance;
    }
}