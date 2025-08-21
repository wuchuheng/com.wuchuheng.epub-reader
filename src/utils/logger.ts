import dayjs from 'dayjs';

const now = () => dayjs().format('HH:mm:ss');

export const logger = {
  log: (...message: any[]) => {
    console.log(`[${now()}] [LOG] `, ...message);
  },
  error: (...message: any[]) => {
    console.error(`[${now()}] [ERROR] `, ...message);
  },
  warn: (...message: any[]) => {
    console.warn(`[${now()}] [WARN] `, ...message);
  },
};
