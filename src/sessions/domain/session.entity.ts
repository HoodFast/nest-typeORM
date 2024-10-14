export class SessionEntity {
  id: string;
  iat: Date;
  expireDate: Date;
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
}
