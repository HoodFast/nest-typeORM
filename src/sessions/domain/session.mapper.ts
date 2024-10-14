import { SessionsOutputType } from '../api/output/session.output';
import { SessionDocument } from './session.schema';

export const sessionMapper = (
  sessions: SessionDocument[],
): SessionsOutputType[] => {
  const result = sessions.map((i) => {
    return {
      ip: i.ip,
      title: i.title,
      lastActiveDate: i.iat,
      deviceId: i.deviceId,
    };
  });
  return result;
};
