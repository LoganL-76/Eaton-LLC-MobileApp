import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearQueue, enqueueAction, getQueue, removeAction } from '../../lib/offlineQueue';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorage.delete(key);
    }),
  },
}));

describe('offlineQueue', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  it('stores expectedStatus when enqueueing a status update', async () => {
    await enqueueAction({
      type: 'status_update',
      assignmentId: 42,
      status: 'en_route',
      expectedStatus: 'assigned',
    });

    const queue = await getQueue();

    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type: 'status_update',
      assignmentId: 42,
      status: 'en_route',
      expectedStatus: 'assigned',
    });

    expect((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]).toContain('"expectedStatus":"assigned"');
  });

  it('removes a single queued action by id', async () => {
    await enqueueAction({
      type: 'status_update',
      assignmentId: 1,
      status: 'en_route',
      expectedStatus: 'assigned',
    });
    await enqueueAction({
      type: 'status_update',
      assignmentId: 2,
      status: 'completed',
      expectedStatus: 'on_site',
    });

    const queue = await getQueue();
    await removeAction(queue[0].id);

    const remaining = await getQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].assignmentId).toBe(2);
  });

  it('clears the queue', async () => {
    await enqueueAction({
      type: 'status_update',
      assignmentId: 7,
      status: 'completed',
      expectedStatus: 'on_site',
    });

    await clearQueue();

    expect(await getQueue()).toEqual([]);
  });
});
