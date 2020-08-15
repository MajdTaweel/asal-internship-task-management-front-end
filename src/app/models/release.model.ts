import {AbstractAuditing} from './abstract-auditing.model';
import {User} from './user.model';

export class Release extends AbstractAuditing {
  constructor(
    public id: string,
    public title: string,
    public type: string,
    public deadline: Date,
    public status: ReleaseStatus,
    public team: User[] = [],
    public createdBy: string = null,
    public createdDate: Date = null,
    public lastModifiedBy: string = null,
    public lastModifiedDate: Date = null,
  ) {
    super();
  }
}

export enum ReleaseStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export const RELEASE_STATUSES = [ReleaseStatus.NEW, ReleaseStatus.IN_PROGRESS, ReleaseStatus.DONE];
