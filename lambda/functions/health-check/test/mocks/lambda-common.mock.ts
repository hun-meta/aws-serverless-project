export class BaseService {
  protected CONTEXT: string;
  protected serviceCode: string;
  protected logger: any;

  constructor(context: string, serviceCode: string, logger: any) {
    this.CONTEXT = context;
    this.serviceCode = serviceCode;
    this.logger = logger;
  }

  protected buildError(error: any): never {
    throw error;
  }
}

export class LoggerService {
  private static instance: LoggerService;

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  info(context: string, message: string, data?: any): void {
    console.log(`[INFO][${context}]ℹ️ ${message}`, data || '');
  }

  error(context: string, message: string, data?: any): void {
    console.error(`[ERROR][${context}]❌ ${message}`, data || '');
  }

  warn(context: string, message: string, data?: any): void {
    console.warn(`[WARN][${context}]⚠️ ${message}`, data || '');
  }

  debug(context: string, message: string, data?: any): void {
    console.debug(`[DEBUG][${context}]🐛 ${message}`, data || '');
  }
}

export const ResponseHandler = {
  success: jest.fn((data: any, message: string) => ({
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message,
      data
    })
  })),
  error: jest.fn((error: any, message: string) => ({
    statusCode: error.statusCode || 500,
    body: JSON.stringify({
      success: false,
      message,
      error: error.message
    })
  }))
};