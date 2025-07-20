export declare class LoggerService {
    static instance: LoggerService;
    static getInstance(): LoggerService;
    info(context: string, message: string, data?: any): void;
    error(context: string, message: string | undefined, error: any): void;
    warn(context: string, message: string, data?: any): void;
    debug(context: string, targetName: string, value: any): void;
}
declare const _default: LoggerService;
export default _default;
