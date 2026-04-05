import { buildQueuedStatusUpdateAction, buildStatusUpdatePayload } from '../../lib/statusUpdatePayload';

describe('statusUpdatePayload', () => {
  it('builds the API payload with expected_status', () => {
    expect(buildStatusUpdatePayload('completed', 'on_site')).toEqual({
      status: 'completed',
      expected_status: 'on_site',
    });
  });

  it('builds the queued action with expectedStatus', () => {
    expect(buildQueuedStatusUpdateAction(17, 'en_route', 'assigned')).toEqual({
      type: 'status_update',
      assignmentId: 17,
      status: 'en_route',
      expectedStatus: 'assigned',
    });
  });
});
