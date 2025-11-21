import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.method === 'GET' && !request.url.startsWith('/assets')) {
      response.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
    } else {
      response.status(404).json({
        statusCode: 404,
        message: exception.message,
        error: 'Not Found',
      });
    }
  }
}
