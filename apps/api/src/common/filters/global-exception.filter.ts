// ============================================================
// Global Exception Filter — RFC 7807 Problem Details
// ============================================================
// Normalizes ALL errors into a consistent JSON response shape.
// See: Doc 06 §4, Doc 22 §5
// ============================================================
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let type = 'about:blank';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message as string || exception.message;
      type = `https://pulse.dev/errors/${status}`;
    }

    // Log 5xx errors at error level, 4xx at warn level
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} → ${status}`, (exception as Error)?.stack);
      require('fs').appendFileSync('error.log', `${new Date().toISOString()} - ${(exception as Error)?.stack}\n`);
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${status}: ${message}`);
    }

    const body: ProblemDetails & { errors?: any[] } = {
      type,
      title: HttpStatus[status] || 'Error',
      status,
      detail: message,
      instance: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as Record<string, unknown>;
      if (exceptionResponse && exceptionResponse.errors) {
        body.errors = exceptionResponse.errors as any[];
      }
    }

    response.status(status).json(body);
  }
}
