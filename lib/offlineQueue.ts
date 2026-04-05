import AsyncStorage from '@react-native-async-storage/async-storage';

// This file sets up the offline queue for React Query mutations
// React Query's mutation queue is built-in and automatically retries failed mutations when the network is back

// Key used to store the queue in AsyncStorage
// All queued actions are stored together as a single JSON array under this key
const QUEUE_KEY = 'EATON_OFFLINE-ACTION-QUEUE';

// Represents a single queued action
// Right now the only action type is 'status-update', but this shape
// makes it easy to add new action types ('add_note', 'submit_form', etc) in the future without changing the underlying queue logic
export type QueuedAction = {
    id: string; // unique ID for this action, used for deduplication and tracking
    type: 'status_update'; // type of action, can be extended to support more types in the future
    assignmentId: number;
    status: string;
    expectedStatus: string;
    queuedAt: string; // ISO timestamp of when the action was queued, useful for debugging and ordering
};

// Reads the full queue from AsyncStorage
// Returns an empty array if nothing is queued yet
export async function getQueue(): Promise<QueuedAction[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
}

// Adds a new action to the queue in AsyncStorage (FIFO order)
// The caller doesn't need to supply id or queuedAt - this function generates them
export async function enqueueAction(
    action: Omit<QueuedAction, 'id' | 'queuedAt'>
): Promise<void> {
    const queue = await getQueue();

    const newAction: QueuedAction = {
        ...action,
        id: Math.random().toString(36).slice(2), // simple unique ID generator, can be replaced with a more robust solution if needed
        queuedAt: new Date().toISOString(),
    };

    queue.push(newAction);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
// Removes a single action from the queue by its ID.
// called after an action has been successfully synced with the backend
export async function removeAction(id: string): Promise<void> {
    const queue = await getQueue();
    const updated = queue.filter(action => action.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

// Wipes the entire queue
// called after a full sync completes successfully, or can be used for debugging
export async function clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
}
