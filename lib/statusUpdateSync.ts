import type { QueuedAction } from './offlineQueue';
import { isStatusSyncConflict } from './syncConflicts';
import { buildStatusUpdatePayload } from './statusUpdatePayload';

type ReplayAction = Extract<QueuedAction, { type: 'status_update' }>;

type ReplayDependencies = {
  patchStatus: (
    assignmentId: number,
    payload: ReturnType<typeof buildStatusUpdatePayload>
  ) => Promise<unknown>;
  removeAction: (id: string) => Promise<void>;
  onConflict: (action: ReplayAction, error: unknown) => void | Promise<void>;
  onTransientFailure: (action: ReplayAction, error: unknown) => void;
  invalidateQueries: () => Promise<void>;
};

export async function replayQueuedStatusUpdates(
  queue: QueuedAction[],
  dependencies: ReplayDependencies
): Promise<void> {
  for (const action of queue) {
    if (action.type !== 'status_update') continue;

    try {
      await dependencies.patchStatus(
        action.assignmentId,
        buildStatusUpdatePayload(action.status, action.expectedStatus)
      );
      await dependencies.removeAction(action.id);
    } catch (error) {
      if (isStatusSyncConflict(error as { response?: { status?: number; data?: unknown } })) {
        await dependencies.onConflict(action, error);
        await dependencies.removeAction(action.id);
        continue;
      }

      dependencies.onTransientFailure(action, error);
      break;
    }
  }

  await dependencies.invalidateQueries();
}