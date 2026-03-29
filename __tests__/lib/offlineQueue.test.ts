import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearQueue, enqueueAction, getQueue, OFFLINE_QUEUE_KEY } from '../../lib/offlineQueue';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
};

describe('offlineQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enqueueAction adds item to queue', async () => {
    storage.getItem.mockResolvedValueOnce(null);
    storage.setItem.mockResolvedValueOnce(null);

    const queued = await enqueueAction({
      type: 'status_update',
      assignmentId: 101,
      status: 'en_route',
    });

    expect(queued.type).toBe('status_update');
    expect(queued.assignmentId).toBe(101);
    expect(queued.status).toBe('en_route');
    expect(typeof queued.id).toBe('string');
    expect(typeof queued.queuedAt).toBe('string');

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      OFFLINE_QUEUE_KEY,
      JSON.stringify([queued])
    );
  });

  it('clearQueue removes queue key', async () => {
    storage.removeItem.mockResolvedValueOnce(null);

    await clearQueue();

    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(OFFLINE_QUEUE_KEY);
  });

  it('multiple enqueued items preserve FIFO order', async () => {
    storage.getItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        JSON.stringify([
          {
            id: 'first-id',
            type: 'status_update',
            assignmentId: 201,
            status: 'assigned',
            queuedAt: '2026-03-28T10:00:00.000Z',
          },
        ])
      );

    storage.setItem.mockResolvedValue(null);

    const firstQueued = await enqueueAction({
      type: 'status_update',
      assignmentId: 201,
      status: 'assigned',
    });

    const secondQueued = await enqueueAction({
      type: 'status_update',
      assignmentId: 202,
      status: 'completed',
    });

    const lastWritePayload = storage.setItem.mock.calls[1][1];
    const parsed = JSON.parse(lastWritePayload);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].assignmentId).toBe(firstQueued.assignmentId);
    expect(parsed[1].assignmentId).toBe(secondQueued.assignmentId);
    expect(parsed[0].status).toBe('assigned');
    expect(parsed[1].status).toBe('completed');
  });

  it('getQueue returns empty array when storage is invalid JSON', async () => {
    storage.getItem.mockResolvedValueOnce('not-json');

    const queue = await getQueue();

    expect(queue).toEqual([]);
  });
});
