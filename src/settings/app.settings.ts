import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../exceptionFilters/exception.filters';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
const cookieParser = require('cookie-parser');
export const appSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponce: { message: string; field: string }[] = [];

        errors.forEach((e) => {
          if (!e.constraints) return;
          const keys = Object.keys(e.constraints);
          keys.forEach((key: string) => {
            if (!e.constraints) return;
            errorsForResponce.push({
              message: e.constraints[key],
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorsForResponce);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser('secret key'));
};
