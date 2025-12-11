import { DEFAULT_CONFIG } from '@/constants/epub';

export type QueueTicket = {
  done: () => void;
};

type QueueEntry = {
  limit: number;
  resolve: (ticket: QueueTicket) => void;
};

type QueueState = {
  active: number;
  waiting: QueueEntry[];
};

const DEFAULT_KEY = 'default';
const queues = new Map<string, QueueState>();

const normalizeKey = (api: string): string => {
  const trimmed = api?.trim();
  return trimmed || DEFAULT_KEY;
};

const getState = (key: string): QueueState => {
  const existing = queues.get(key);
  if (existing) {
    return existing;
  }

  const created: QueueState = { active: 0, waiting: [] };
  queues.set(key, created);
  return created;
};

const startNext = (state: QueueState) => {
  if (state.waiting.length === 0) {
    return;
  }

  for (let index = 0; index < state.waiting.length; index += 1) {
    const entry = state.waiting[index];
    if (state.active < entry.limit) {
      state.waiting.splice(index, 1);
      state.active += 1;
      entry.resolve(createTicket(state));
      break;
    }
  }
};

const createTicket = (state: QueueState): QueueTicket => {
  let released = false;

  const done = () => {
    if (released) {
      return;
    }
    released = true;

    state.active = Math.max(0, state.active - 1);
    startNext(state);
  };

  return { done };
};

export const waitForQueueSlot = async (api: string, limit: number): Promise<QueueTicket> => {
  const key = normalizeKey(api);
  const state = getState(key);
  const effectiveLimit = Math.max(1, limit || DEFAULT_CONFIG.DEFAULT_MAX_CONCURRENT_REQUESTS);

  if (state.active < effectiveLimit) {
    state.active += 1;
    return createTicket(state);
  }

  return new Promise((resolve) => {
    state.waiting.push({
      limit: effectiveLimit,
      resolve,
    });
  });
};
