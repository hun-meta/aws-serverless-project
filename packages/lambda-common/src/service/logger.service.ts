export class LoggerService {
    public static instance: LoggerService;

    static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    info(context: string, message: string, data?: any): void {
        const INFO = '[INFO]';
        const CONTEXT = `[${context}]`;
        const ICON = 'ℹ️';
        console.log(INFO + CONTEXT + ICON + ' ' + message+(data ? ' %o' : ''), data);
    }

    error(context: string, message: string = '', error: any): void {
        const ERROR = '[ERROR]';
        const CONTEXT = `[${context}]`;
        const ICON = '❌';
        console.error(ERROR + CONTEXT + ICON + ' Error occured (' + message + '): %o', error);
        if (error.stack) {
            console.error(ERROR + CONTEXT + ICON + ' Error stack: %o', error);
        }
    }

    warn(context: string, message: string, data?: any): void {
        const WARN = '[WARN]';
        const CONTEXT = `[${context}]`;
        const ICON = '⚠️';
        console.log(WARN + CONTEXT + ICON + ' ' + message+(data ? ' %o' : ''), data);
    }

    debug(context: string, targetName: string, value: any): void {
        const DEBUG = '[DEBUG]';
        const CONTEXT = `[${context}]`;
        const ICON = '🔍'; // debug 아이콘
        console.log(DEBUG + CONTEXT + ICON + ` ${targetName}: %o`, value);
    }
}

// 싱글톤 인스턴스를 생성하고 export
export default LoggerService.getInstance();
