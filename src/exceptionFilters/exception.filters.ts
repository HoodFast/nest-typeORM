import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as process from 'process';

const errorsCode = [400, 401, 403, 404];

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    if (status === 429) {
      return response.sendStatus(429);
    }
    if (errorsCode.includes(status)) {
      const errorResponce: {
        errorsMessages: { message: string; field: string }[];
      } = {
        errorsMessages: [],
      };
      const responceBody: any = exception.getResponse();

      if (typeof responceBody.message === 'string') {
        return response.status(status).send({
          errorsMessages: [
            {
              message: responceBody.message || 'error message',
              field: responceBody.error || 'error',
            },
          ],
        });
      } else {
        responceBody.message.forEach((m: { message: string; field: string }) =>
          errorResponce.errorsMessages.push(m),
        );
      }

      response.status(status).json(errorResponce);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    if (
      process.env.envorinment !== 'production' &&
      errorsCode.includes(status) === false
    ) {
      response.status(500).send({
        error: exception.message,
        message: exception,
      });
    } else {
      response.status(500).send('some error');
    }
  }
}
