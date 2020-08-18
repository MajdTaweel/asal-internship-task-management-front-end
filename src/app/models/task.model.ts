import {AbstractAuditing} from './abstract-auditing.model';
import {User} from './user.model';

export class Task extends AbstractAuditing {
  constructor(
    public id: string,
    public title: string,
    public status: TaskStatus,
    public releaseId: string,
    public description?: string,
    public deadline?: Date,
    public assignees: User[] = [],
    public createdBy: string = null,
    public createdDate: Date = null,
    public lastModifiedBy: string = null,
    public lastModifiedDate: Date = null,
  ) {
    super();
  }
}

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  INVALID = 'INVALID',
  WAITING_FOR_REVIEW = 'WAITING_FOR_REVIEW',
  DONE = 'DONE'
}

const NEAR_DUE_MIN_DAYS = 3;

export function isTaskOverdue(task: Task): boolean {
  if (task.status === TaskStatus.DONE) {
    return false;
  }
  let date = task.deadline;
  if (!date) {
    return false;
  }
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return (new Date().valueOf()) >= date.valueOf();
}

export function isTaskNearDue(task: Task): boolean {
  if (task.status === TaskStatus.DONE) {
    return false;
  }
  let date = task.deadline;
  if (!date) {
    return false;
  }
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const minDays = NEAR_DUE_MIN_DAYS * 24 * 60 * 60 * 1000;
  return date.valueOf() - (new Date().valueOf()) <= minDays;
}
