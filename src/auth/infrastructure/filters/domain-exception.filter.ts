import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    // Handle domain validation errors
    if (message.includes('Invalid email format')) {
      status = HttpStatus.BAD_REQUEST;
    } else if (message.includes('User already exists')) {
      status = HttpStatus.CONFLICT;
    } else if (message.includes('UserId must be')) {
      status = HttpStatus.BAD_REQUEST;
    }

    // If it's already a NestJS exception, use its status
    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
