import { UNDEFINED_ERROR } from "../constant/error-info.constant";
import { CustomException } from "../exception/custom.exception";

/**
 * 외부 서비스(Database, S3, Third-party API 등)와의 상호작용을 위한 추상 기본 클래스
 * 각 외부 서비스 클래스는 이 클래스를 상속받아 구현해야 합니다.
 */
export abstract class BaseExternalService {
    protected externalIdentifier: string;
    protected externalCode: string;

    protected constructor(externalIdentifier: string, externalCode: string) {
        this.externalIdentifier = externalIdentifier;
        this.externalCode = externalCode;
    }

    /**
     * 외부 서비스에서 발생한 에러를 CustomException으로 변환하고 외부 식별자와 코드를 설정합니다.
     * @param error - 발생한 에러
     * @throws CustomException - 외부 식별자와 코드가 설정된 커스텀 예외
     */
    protected buildError(error: Error): never {
        if (error instanceof CustomException) {
            error.setExternalIdentifier(this.externalIdentifier);
            error.setExternalCode(this.externalCode);
            throw error;
        }else{
            throw new CustomException(error, UNDEFINED_ERROR);
        }
    }
}