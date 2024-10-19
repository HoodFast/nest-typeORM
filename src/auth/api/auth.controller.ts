import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './input/login.dto';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import { Limiter, LimiterForRegistration } from '../../guards/limitter.guard';
import { recoveryPass } from './input/recovery.password.input';
import { recoveryPassInputDto } from './input/new.password.input';
import { JwtService } from '../infrastructure/jwt.service';
import { AccessTokenAuthGuard } from '../../guards/access.token.auth.guard';
import { UserId } from '../../decorators/userId';
import { confirmDto } from '../../users/api/input/conf.code.dto';
import { UserInputDto } from '../../users/api/input/userInput.dto';
import { emailResendingDto } from './input/email.resending.input';
import { RefreshTokenGuard } from '../../guards/refresh-token.guards';
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql.query.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}
  @HttpCode(200)
  @UseGuards(Limiter)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const title = req.get('User-Agent') || 'none title';
      if (!body.loginOrEmail || !body.password) {
        throw new BadRequestException('Missing login or password');
      }
      const tokens = await this.authService.loginTokensPair(
        body.loginOrEmail,
        body.password,
        ip,
        title,
      );

      if (!tokens) throw new UnauthorizedException('get tokens pair error');
      const { accessToken, refreshToken } = tokens;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken };
    } catch (e) {
      throw e;
    }
  }
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request) {
    const token = req.cookies.refreshToken;
    const user = await this.jwtService.checkRefreshToken(token);
    if (!user) throw new UnauthorizedException('check refresh token error');
    await this.authService.deleteSession(token);
    // const title = req.get('User-Agent') || 'none title';
    // const token = req.cookies.refreshToken;
    // const checkToken = await this.jwtService.checkRefreshToken(token);
    // if (!checkToken) {
    //   await this.authService.deleteSessionUsingLogin(userId, title);
    //   return;
    // }
    // await this.authService.deleteSession(token);
    // // if (!deleteSession) throw new UnauthorizedException();
    return;
  }
  @UseGuards(LimiterForRegistration)
  @HttpCode(204)
  @Post('registration')
  async registration(@Body() data: UserInputDto) {
    const { login, email, password } = data;
    const res = await this.usersService.createUser(login, email, password);
    if (!res) throw new UnauthorizedException('create user error');
    return;
  }
  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('registration-confirmation')
  async emailConfirmation(@Body() data: confirmDto) {
    if (!data.code) throw new BadRequestException('error code', 'code');
    await this.authService.confirmEmail(data.code);
    return {};
  }
  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() data: recoveryPass) {
    const email = data.email;
    await this.authService.sendRecovery(email);
    return;
  }
  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('new-password')
  async newPassword(@Body() data: recoveryPassInputDto) {
    return await this.usersService.changePass(data);
  }

  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const title = req.headers['user-agent'] || 'none title';
    const ip = req.ip || 'none ip';

    const token = req.cookies.refreshToken;

    const user = await this.jwtService.checkRefreshToken(token);
    if (!user) throw new UnauthorizedException('check refresh token error');

    const tokens = await this.authService.refreshTokensPair(
      user,
      ip,
      title,
      token,
    );
    const addToBlackList =
      await this.usersSqlQueryRepository.addTokenToBlackList(user._id, token);
    if (!addToBlackList) throw new NotFoundException();
    const { accessToken, refreshToken } = tokens;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }
  @UseGuards(Limiter)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() data: emailResendingDto) {
    await this.authService.resendConfirmationCode(data.email);
    return {};
  }
  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  async getMe(@UserId() userId: string) {
    const my = await this.usersSqlQueryRepository.getMe(userId);
    if (!my) throw new UnauthorizedException('getMe error');
    return {
      userId: my.id,
      login: my.accountData.login,
      email: my.accountData.email,
    };
  }
}
