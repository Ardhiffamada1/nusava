import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected server error occurred';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        error = (resObj.error as string) || (resObj.code as string) || exception.name;
        details = resObj.errors || null;
      } else {
        message = String(res);
      }
    } else if (typeof exception === 'object' && exception !== null && 'code' in exception) {
      // Prisma error handling
      const prismaErr = exception as { code: string; meta?: Record<string, unknown>; message?: string };
      if (prismaErr.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        error = 'UNIQUE_CONSTRAINT_VIOLATION';
        const target = (prismaErr.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${target} already exists.`;
      } else if (prismaErr.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        error = 'RECORD_NOT_FOUND';
        message = 'The requested resource was not found.';
      } else {
        this.logger.error(`Unhandled Prisma error: ${prismaErr.code}`, prismaErr.message);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      ...(details ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
