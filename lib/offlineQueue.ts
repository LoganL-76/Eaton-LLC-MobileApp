import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_action_queue';

export type QueuedAction = {
  id: string;
  type: 'status_update';
  assignmentId: number;
  status: string;
  queuedAt: string;
};

type EnqueueInput = Omit<QueuedAction, 'id' | 'queuedAt'>;

function buildActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

export async function enqueueAction(action: EnqueueInput): Promise<QueuedAction> {
  const queue = await getQueue();
  const nextAction: QueuedAction = {
    ...action,
    id: buildActionId(),
    queuedAt: new Date().toISOString(),
  };

  queue.push(nextAction);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return nextAction;
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export const OFFLINE_QUEUE_KEY = QUEUE_KEY;
