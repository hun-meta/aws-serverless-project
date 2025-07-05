import { UNDEFINED_ERROR } from "../constant/error-info.constant";
import { CustomException } from "../exception/custom.exception";
import { LoggerService } from "./logger.service";

export abstract class BaseService {
    protected serviceCode: string;
    protected readonly CONTEXT: string;
    protected logger: LoggerService;

    protected constructor(context: string, serviceCode: string, logger: LoggerService) {
        this.CONTEXT = context;
        this.serviceCode = serviceCode;
        this.logger = logger;
    }

    protected buildError(error: Error): never {
        this.logger.error(this.CONTEXT, 'Error occured', error);
        if (error instanceof CustomException) {
            error.setServiceCode(this.serviceCode);
            throw error;
        } else {
            throw new CustomException(error, UNDEFINED_ERROR);
        }
    }
}