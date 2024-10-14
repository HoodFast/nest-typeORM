import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tokenPayload;
  },
);
