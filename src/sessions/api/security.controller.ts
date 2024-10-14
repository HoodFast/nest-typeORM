import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SessionQueryRepository } from '../infrastructure/session.query.repository';
import { UserId } from '../../decorators/userId';
import { DeleteAllSessionsCommand } from './useCases/delete-all-sessions.usecase';
import { InterlayerNotice } from '../../base/models/Interlayer';
import { UpdateOutputData } from '../../base/models/updateOutput';
import { DeleteSessionByIdCommand } from './useCases/delete-session-by-id.usecase';

import { SessionsOutputType } from './output/session.output';
import { GetAllSessionCommand } from './useCases/get-all-sessions.usecase';
import { RefreshTokenGuard } from '../../guards/refresh-token.guards';
import { TokenPayload } from '../../decorators/token-payload';

@Controller('security')
export class SecurityController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  async getDevices(@UserId() userId: string): Promise<SessionsOutputType[]> {
    const command = new GetAllSessionCommand(userId);
    const result = await this.queryBus.execute<
      GetAllSessionCommand,
      InterlayerNotice<SessionsOutputType[]>
    >(command);
    if (result.hasError())
      throw new NotFoundException(result.extensions[0].message);
    if (!result.data) throw new NotFoundException();
    return result.data;
  }
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  async deleteAllDevices(
    @UserId() userId: string,
    @TokenPayload() tokenPayload: any,
  ) {
    const command = new DeleteAllSessionsCommand(userId, tokenPayload.deviceId);
    const result = await this.commandBus.execute<
      DeleteAllSessionsCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);
    if (result.hasError())
      throw new NotFoundException(result.extensions[0].message);
    if (!result.data) throw new NotFoundException();
    return;
  }
  @HttpCode(204)
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:id')
  async deleteSessionById(
    @Param('id') deviceId: string,
    @UserId() userId: string,
  ) {
    const command = new DeleteSessionByIdCommand(deviceId, userId);
    const result = await this.commandBus.execute<
      DeleteSessionByIdCommand,
      InterlayerNotice<UpdateOutputData>
    >(command);
    if (result.hasError()) {
      if (result.extensions[0].key === '1') throw new NotFoundException();
      if (result.extensions[0].key === '2') throw new ForbiddenException();
    }
    return;
  }
}
