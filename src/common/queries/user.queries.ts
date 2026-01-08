import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SORTBY } from '../enums';
import { updateUserParams } from '../../../dist/user/user-types';

export const baseUserSelect = [
  'user.id',
  'user.email',
  'user.role',
  'user.username',
  'user.firstname',
  'user.lastname',
];

/**
 * Base query for listing users
 */
export function buildFindAllUsersQuery(userRepository: Repository<User>) {
  return userRepository
    .createQueryBuilder('user')
    .select(baseUserSelect)
    .orderBy(`user.${SORTBY.CREATED_AT}`, SORTBY.DESC);
}

/**
 * Query for finding a single user by id
 */
export function buildFindUserByIdQuery(
  userRepository: Repository<User>,
  id: string,
) {
  return userRepository
    .createQueryBuilder('user')
    .select(baseUserSelect)
    .where('user.id = :id', { id });
}

export function buildUpdateUserByIdQuery(
  userRepository: Repository<User>,
  id: string,
  updateUserParams: updateUserParams,
) {
  return userRepository
    .createQueryBuilder('user')
    .update({
      ...updateUserParams,
      updatedAt: () => 'CURRENT_TIMESTAMP',
    })
    .where('id = :id', { id });
}

export function buildDeleteUserByIdQuery(
  userRepository: Repository<User>,
  id: string,
) {
  return userRepository
    .createQueryBuilder('user')
    .update(User)
    .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
    .where('id = :id', { id });
}
