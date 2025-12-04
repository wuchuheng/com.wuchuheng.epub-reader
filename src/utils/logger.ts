import dayjs from 'dayjs';

const now = () => dayjs().format('HH:mm:ss.SSS');

export const logger = {
  log: (...message: unknown[]) => {
    console.log(`[${now()}] [LOG] `, ...message);
  },
  info: (...message: unknown[]) => {
    console.log(`[${now()}] [INFO] `, ...message);
  },
  error: (...message: unknown[]) => {
    console.error(`[${now()}] [ERROR] `, ...message);
  },
  warn: (...message: unknown[]) => {
    console.warn(`[${now()}] [WARN] `, ...message);
  },
};
