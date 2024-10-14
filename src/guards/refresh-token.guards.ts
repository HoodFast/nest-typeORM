import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../auth/infrastructure/jwt.service';
import { UsersSqlQueryRepository } from '../users/infrastructure/users.sql.query.repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersQueryRepository: UsersSqlQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken =
      request.cookies.refreshToken || request.body.refreshToken;

    if (!refreshToken)
      throw new UnauthorizedException(
        `RefreshTokenGuard - dont find token in cookies and body`,
      );
    const jwtPayload = await this.jwtService.verifyRefreshToken(refreshToken);

    if (!jwtPayload)
      throw new UnauthorizedException(
        `RefreshTokenGuard - token dont verify ${refreshToken}`,
      );
    const user = await this.usersQueryRepository.getUserById(jwtPayload.userId);
    if (!user) {
      throw new UnauthorizedException('RefreshTokenGuard - user not found');
    }
    request.userId = user._id;
    request.tokenPayload = jwtPayload;
    return true;
  }
}
