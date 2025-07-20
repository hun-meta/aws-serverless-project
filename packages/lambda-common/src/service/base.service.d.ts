import { LoggerService } from "./logger.service";
export declare abstract class BaseService {
    protected serviceCode: string;
    protected readonly CONTEXT: string;
    protected logger: LoggerService;
    protected constructor(context: string, serviceCode: string, logger: LoggerService);
    protected buildError(error: Error): never;
}
