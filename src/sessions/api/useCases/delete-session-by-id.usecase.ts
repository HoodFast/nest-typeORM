import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { UpdateOutputData } from '../../../base/models/updateOutput';
import { SessionSqlRepository } from '../../infrastructure/session.sql.repository';

export class DeleteSessionByIdCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}
@CommandHandler(DeleteSessionByIdCommand)
export class DeleteSessionByIdUseCase
  implements
    ICommandHandler<
      DeleteSessionByIdCommand,
      InterlayerNotice<UpdateOutputData>
    >
{
  constructor(private sessionSqlRepository: SessionSqlRepository) {}
  async execute(
    command: DeleteSessionByIdCommand,
  ): Promise<InterlayerNotice<UpdateOutputData>> {
    const notice = new InterlayerNotice<UpdateOutputData>();
    const sessionsByDeviceId =
      await this.sessionSqlRepository.getSessionByDeviceId(command.deviceId);

    if (!sessionsByDeviceId) {
      notice.addError('invalid meta data', '1');
      return notice;
    }
    if (sessionsByDeviceId.userId.toString() !== command.userId) {
      notice.addError('forbidden', '2');
      return notice;
    }
    await this.sessionSqlRepository.deleteByDeviceId(command.deviceId);
    notice.addData({ updated: true });
    return notice;
  }
}
