import { config } from 'dotenv';

config();
export const appConfig = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_TYPE: process.env.DB_TYPE as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,
  RT_TIME: process.env.AC_TIME as string,
  RT_SECRET: process.env.RT_SECRET as string,
  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  RECOVERY_SECRET: process.env.RECOVERY_SECRET as string,
  RECOVERY_TIME: process.env.RECOVERY_TIME as string,
};
