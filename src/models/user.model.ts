export class User {
  activated: boolean;
  authorities: Role[];
  createdBy: string;
  createdDate: Date;
  email: string;
  firstName: string;
  id: string;
  imageUrl: string;
  langKey: string;
  lastModifiedBy: string;
  lastModifiedDate: Date;
  lastName: string;
  login: string;
}

export class UserWithFullName extends User {
  fullName: string;
}

export enum Role {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
  ANONYMOUS = 'ROLE_ANONYMOUS',
  LEAD = 'ROLE_TEAM_LEAD'
}
