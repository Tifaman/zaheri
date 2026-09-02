import { Queue } from 'bullmq';
import { NotificationsService } from './notifications.service';
import {
  CASE_ROUTED_JOB,
  CaseRoutedJobData,
  QUEUE_NEAR_JOB,
  QueueNearJobData,
} from './notifications.types';

describe('NotificationsService', () => {
  it('enqueues a queue-near job carrying only logistics fields', async () => {
    const add = jest.fn().mockResolvedValue(undefined);
    const queue = { add } as unknown as Queue;
    const service = new NotificationsService(queue);

    const data: QueueNearJobData = {
      registrationNumber: 'MNH-0002',
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-9',
    };

    await service.enqueueQueueNearNotification(data);

    expect(add).toHaveBeenCalledWith(QUEUE_NEAR_JOB, data);
    // Defence in depth: even though QueueNearJobData's type already excludes
    // them, assert no clinical key ever rides along in the enqueued payload.
    const [, enqueuedData] = add.mock.calls[0];
    expect(Object.keys(enqueuedData).sort()).toEqual(
      ['queueNumber', 'registrationNumber', 'room', 'ward'].sort(),
    );
  });

  it('enqueues a case-routed job carrying only logistics fields', async () => {
    const add = jest.fn().mockResolvedValue(undefined);
    const queue = { add } as unknown as Queue;
    const service = new NotificationsService(queue);

    const data: CaseRoutedJobData = {
      registrationNumber: 'MNH-0002',
      disposition: 'SEE_DOCTOR',
      ward: 'OPD',
      room: 'OPD',
      queueNumber: 'Q-9',
    };

    await service.enqueueCaseRoutedNotification(data);

    expect(add).toHaveBeenCalledWith(CASE_ROUTED_JOB, data);
    const [, enqueuedData] = add.mock.calls[0];
    expect(Object.keys(enqueuedData).sort()).toEqual(
      ['disposition', 'queueNumber', 'registrationNumber', 'room', 'ward'].sort(),
    );
  });
});
