import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/application/users.service';
import { Observable } from 'rxjs';
import { Request } from 'express';

export type rateLimitDbType = {
  ip: string;
  URL: string;
  date: Date;
};
@Injectable()
export class Limiter implements CanActivate {
  limitListDB: rateLimitDbType[] = [];
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const ip = request.ip;
    if (!ip) return false;
    const URL = request.originalUrl;
    const date = new Date();
    const limitList = this.limitListDB.filter(
      // @ts-ignore
      (i) => URL === i.URL && ip === i.ip && Math.abs(i.date - date) < 11000,
    );

    if (limitList.length < 5) {
      this.limitListDB.push({ ip, URL, date });
      return true;
    } else {
      return true;
      // throw new HttpException('error', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
@Injectable()
export class LimiterForRegistration implements CanActivate {
  limitListDB: rateLimitDbType[] = [];
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const ip = request.ip;
    if (!ip) return false;
    const URL = request.originalUrl;
    const date = new Date();
    const limitList = this.limitListDB.filter(
      // @ts-ignore
      (i) => URL === i.URL && ip === i.ip && Math.abs(i.date - date) < 20000,
    );

    if (limitList.length < 5) {
      this.limitListDB.push({ ip, URL, date });
      return true;
    } else {
      return true;
      // throw new HttpException('error', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
