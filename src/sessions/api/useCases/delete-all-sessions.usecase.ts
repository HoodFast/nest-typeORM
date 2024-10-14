import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { UpdateOutputData } from '../../../base/models/updateOutput';
import { SessionSqlRepository } from '../../infrastructure/session.sql.repository';

export class DeleteAllSessionsCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}
@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase
  implements
    ICommandHandler<
      DeleteAllSessionsCommand,
      InterlayerNotice<UpdateOutputData>
    >
{
  constructor(private sessionSqlRepository: SessionSqlRepository) {}
  async execute(
    command: DeleteAllSessionsCommand,
  ): Promise<InterlayerNotice<UpdateOutputData>> {
    const notice = new InterlayerNotice<UpdateOutputData>();
    await this.sessionSqlRepository.deleteAllSession(
      command.userId,
      command.deviceId,
    );
    notice.addData({ updated: true });
    return notice;
  }
}
