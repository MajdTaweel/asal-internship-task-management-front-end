import {AbstractAuditing} from './abstract-auditing.model';

export class User extends AbstractAuditing {
  constructor(
    public activated: boolean,
    public authorities: Role[],
    public email: string,
    public firstName: string,
    public id: string,
    public imageUrl: string,
    public langKey: string,
    public lastName: string,
    public login: string,
    public createdBy: string = null,
    public createdDate: Date = null,
    public lastModifiedBy: string = null,
    public lastModifiedDate: Date = null,
  ) {
    super();
  }
}

export class UserAlt extends User {
  public fullName: string;

  constructor(user: User) {
    super(
      user.activated,
      user.authorities,
      user.email,
      user.firstName,
      user.id,
      user.imageUrl,
      user.langKey,
      user.lastName,
      user.login,
      user.createdBy,
      user.createdDate,
      user.lastModifiedBy,
      user.lastModifiedDate,
    );
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  getMissingAuthorities(): Role[] {
    return ROLES.filter(role => !this.authorities.includes(role));
  }
}

export enum Role {
  ADMIN = 'ROLE_ADMIN',
  USER = 'ROLE_USER',
  ANONYMOUS = 'ROLE_ANONYMOUS',
  LEAD = 'ROLE_TEAM_LEAD'
}

export const ROLES = [Role.ADMIN, Role.USER, Role.LEAD];
