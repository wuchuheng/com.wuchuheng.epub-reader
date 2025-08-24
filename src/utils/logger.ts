import dayjs from 'dayjs';

const now = () => dayjs().format('HH:mm:ss');

export const logger = {
  log: (...message: unknown[]) => {
    console.log(`[${now()}] [LOG] `, ...message);
  },
  error: (...message: unknown[]) => {
    console.error(`[${now()}] [ERROR] `, ...message);
  },
  warn: (...message: unknown[]) => {
    console.warn(`[${now()}] [WARN] `, ...message);
  },
};
