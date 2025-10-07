import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  message: string[] | string;
  error?: string;
  statusCode?: number;
}

interface ErrorResponse {
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        // Handle validation errors from class-validator
        if (
          exception instanceof BadRequestException &&
          'message' in exceptionResponse
        ) {
          const responseObj = exceptionResponse as ValidationErrorResponse;
          if (Array.isArray(responseObj.message)) {
            // Validation errors from class-validator
            message = responseObj.message.join('. ');
          } else if (typeof responseObj.message === 'string') {
            message = responseObj.message;
          } else {
            message = 'Validation failed';
          }
        } else if ('message' in exceptionResponse) {
          message = (exceptionResponse as ErrorResponse).message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      message,
    });
  }
}
