import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../auth/infrastructure/jwt.service';

@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException('non authorization headers');
    }
    const authType = request.headers.authorization.split(' ')[0];
    if (authType !== 'Bearer') throw new UnauthorizedException('no bearer');
    const token = request.headers.authorization.split(' ')[1];
    const userId = await this.jwtService.getUserIdByToken(token);

    if (!userId) throw new UnauthorizedException('token guard');
    request.userId = userId;
    return true;
  }
}
