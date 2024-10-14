import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InterlayerNotice } from '../../../base/models/Interlayer';
import { SessionsOutputType } from '../output/session.output';
import { SessionSqlQueryRepository } from '../../infrastructure/session.sql.query.repository';

export class GetAllSessionCommand {
  constructor(public userId: string) {}
}
@QueryHandler(GetAllSessionCommand)
export class GetAllSessionUseCase
  implements
    IQueryHandler<GetAllSessionCommand, InterlayerNotice<SessionsOutputType[]>>
{
  constructor(private sessionSqlQueryRepository: SessionSqlQueryRepository) {}
  async execute(
    command: GetAllSessionCommand,
  ): Promise<InterlayerNotice<SessionsOutputType[]>> {
    const notice = new InterlayerNotice<SessionsOutputType[]>();
    const sessions = await this.sessionSqlQueryRepository.getAllSessions(
      command.userId,
    );

    if (!sessions) {
      notice.addError('sessions not found');
      return notice;
    }
    notice.addData(sessions);
    return notice;
  }
}
