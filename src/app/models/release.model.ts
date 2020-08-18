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

const NEAR_DUE_MIN_DAYS = 3;

export function isReleaseOverdue(release: Release): boolean {
  if (release.status === ReleaseStatus.DONE) {
    return false;
  }
  let date = release.deadline;
  if (!date) {
    return false;
  }
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return (new Date().valueOf()) >= date.valueOf();
}

export function isReleaseNearDue(release: Release): boolean {
  if (release.status === ReleaseStatus.DONE) {
    return false;
  }
  let date = release.deadline;
  if (!date) {
    return false;
  }
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const minDays = NEAR_DUE_MIN_DAYS * 24 * 60 * 60 * 1000;
  return date.valueOf() - (new Date().valueOf()) <= minDays;
}
