export enum userRoles {
  ADMIN = 'admin',
  AUTHOR = 'author',
  READER = 'reader',
}

export interface updateUserParams {
  username: string;
  firstname: string;
  lastname: string;
}
