import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/app.settings';
import { TestManager } from '../testManager';
import { SessionSqlRepository } from '../../src/sessions/infrastructure/session.sql.repository';
import { UsersSqlQueryRepository } from '../../src/users/infrastructure/users.sql.query.repository';
import { SessionSqlQueryRepository } from '../../src/sessions/infrastructure/session.sql.query.repository';
import { SessionEntity } from '../../src/sessions/domain/session.entity';

describe('sessions repo tests', () => {
  let app: INestApplication;
  let httpServer;
  let testManager;
  let accessTokenUser1;
  let accessTokenUser2;
  let refreshTokenUser1;
  let refreshTokenUser2;
  let sessionsRepository: SessionSqlRepository;
  let userRepository: UsersSqlQueryRepository;
  let users;
  let sessionsQueryRepository: SessionSqlQueryRepository;
  let sessions;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    testManager = new TestManager(app);
    const tokensUser1 =
      await testManager.createAccessAndRefreshTokenMultiDevices();
    accessTokenUser1 = tokensUser1.accessToken;
    refreshTokenUser1 = tokensUser1.refreshToken;
    const tokensUser2 =
      await testManager.createAccessAndRefreshTokenMultiDevices();
    accessTokenUser2 = tokensUser2.accessToken;
    refreshTokenUser2 = tokensUser2.refreshToken;
    sessionsRepository =
      moduleFixture.get<SessionSqlRepository>(SessionSqlRepository);
    userRepository = moduleFixture.get<UsersSqlQueryRepository>(
      UsersSqlQueryRepository,
    );
    sessionsQueryRepository = moduleFixture.get<SessionSqlQueryRepository>(
      SessionSqlQueryRepository,
    );

    users = await userRepository.getAllUsers({
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchLoginTerm: '',
      searchEmailTerm: '',
    });
    sessions = await sessionsQueryRepository.getAll(users.items[1].id);
  });
  beforeEach(async () => {});

  afterAll(async () => {
    await testManager.deleteAll();
  });
  expect.setState({});

  it('getSessionForUserId', async () => {
    const userId = sessions[0].userId;
    const title = sessions[0].title;

    const session = await sessionsRepository.getSessionForUserId(userId, title);
    await testManager.checkSession(session);
  });
  it('getSessionByDeviceId', async () => {
    const deviceId = sessions[0].deviceId;
    const session = await sessionsRepository.getSessionByDeviceId(deviceId);
    await testManager.checkSession(session);
    expect(session!.deviceId).toBe(deviceId);
  });
  it('createNewSession', async () => {
    const deviceId = sessions[0].deviceId;
    const userId = sessions[0].userId;
    const allSessions = await sessionsQueryRepository.getAll(users.items[1].id);
    if (!allSessions) return;
    const length = allSessions.length;
    const data: Omit<SessionEntity, 'id'> = {
      iat: new Date(),
      title: 'test',
      deviceId,
      ip: '1.0.0',
      expireDate: new Date(),
      userId,
    };
    const session = await sessionsRepository.createNewSession(data);

    const newSession = await sessionsQueryRepository.getAll(users.items[1].id);
    if (!newSession) return;
    const addOneSession = newSession.length;

    expect(session).toBeDefined();
    expect(addOneSession).toEqual(length + 1);
  });
  it('deleteById', async () => {
    const sessionId = sessions[0].id;
    const usreId = users.items[1].id;
    const allSessions = await sessionsQueryRepository.getAll(usreId);
    if (!allSessions) return;
    const length = allSessions.length;

    const session = await sessionsRepository.deleteById(sessionId);

    const newSession = await sessionsQueryRepository.getAll(usreId);
    if (!newSession) return;
    const deleteOneSession = newSession.length;

    expect(session).toBeDefined();
    expect(deleteOneSession).toEqual(length - 1);
  });
  it('deleteByDeviceId', async () => {
    const deviceId = sessions[0].deviceId;
    const usrerId = users.items[1].id;

    const allSessions = await sessionsQueryRepository.getAll(usrerId);
    if (!allSessions) return;
    const length = allSessions.length;

    const session = await sessionsRepository.deleteByDeviceId(deviceId);

    const newSession = await sessionsQueryRepository.getAll(usrerId);
    if (!newSession) return;
    const deleteOneSession = newSession.length;

    expect(session).toBeDefined();
    expect(deleteOneSession).toEqual(length - 1);
  });
  it('getSessionForRefreshDecodeToken', async () => {
    const iat = new Date();
    const deviceId = sessions[0].deviceId;
    const userId = sessions[0].userId;
    const data: Omit<SessionEntity, 'id'> = {
      iat,
      title: 'test',
      deviceId,
      ip: '1.0.0',
      expireDate: new Date(),
      userId,
    };
    await sessionsRepository.createNewSession(data);

    const session = await sessionsRepository.getSessionForRefreshDecodeToken(
      iat,
      deviceId,
    );
    await testManager.checkSession(session);
  });
});
