import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

export const setAppPipes = (app: INestApplication) => {
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
};
