export class User {
  constructor(
    public activated: boolean,
    public authorities: Role[],
    public createdBy: string,
    public createdDate: Date,
    public email: string,
    public firstName: string,
    public id: string,
    public imageUrl: string,
    public langKey: string,
    public lastModifiedBy: string,
    public lastModifiedDate: Date,
    public lastName: string,
    public login: string,
  ) {
  }
}

export class UserAlt extends User {
  public fullName: string;

  constructor(user: User) {
    super(
      user.activated,
      user.authorities,
      user.createdBy,
      user.createdDate,
      user.email,
      user.firstName,
      user.id,
      user.imageUrl,
      user.langKey,
      user.lastModifiedBy,
      user.lastModifiedDate,
      user.lastName,
      user.login,
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
