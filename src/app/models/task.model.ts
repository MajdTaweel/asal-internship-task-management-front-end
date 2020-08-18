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
