import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../auth/infrastructure/jwt.service';

@Injectable()
export class AccessTokenGetId implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      return true;
    }
    const tokenBearer = request.headers.authorization;
    const token = tokenBearer.split(' ')[1];
    const userId = await this.jwtService.getUserIdByToken(token);
    request.userId = userId;
    return true;
  }
}
