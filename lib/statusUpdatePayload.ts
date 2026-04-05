import type { QueuedAction } from './offlineQueue';

export type StatusUpdatePayload = {
  status: string;
  expected_status: string;
};

export function buildStatusUpdatePayload(status: string, expectedStatus: string): StatusUpdatePayload {
  return {
    status,
    expected_status: expectedStatus,
  };
}

export function buildQueuedStatusUpdateAction(
  assignmentId: number,
  status: string,
  expectedStatus: string
): Omit<QueuedAction, 'id' | 'queuedAt'> {
  return {
    type: 'status_update',
    assignmentId,
    status,
    expectedStatus,
  };
}