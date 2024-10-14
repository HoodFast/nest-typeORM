import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsersService } from '../users/application/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UsersService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException('auth guard no headers');
    }
    const auth = request.headers.authorization;
    const type = auth.split(' ')[0];
    if (type !== 'Basic')
      throw new UnauthorizedException('type is not a Basic');
    const authPayload = auth.split(' ')[1];
    const decodePayload = Buffer.from(authPayload, 'base64').toString();
    if (decodePayload !== 'admin:qwerty')
      throw new UnauthorizedException('login or pass is incorect');
    return true;
  }
}
