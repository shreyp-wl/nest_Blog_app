import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { updateUserParams } from './user-types';
import {
  getOffset,
  getPageinationMeta,
} from 'src/common/helper/pagination.helper';
import { ERROR_MESSAGES } from 'src/constants/messages.constants';
import { paginationMeta } from 'src/common/interfaces/pagination.interfaces';
import {
  buildDeleteUserByIdQuery,
  buildFindAllUsersQuery,
  buildFindUserByIdQuery,
  buildUpdateUserByIdQuery,
} from 'src/common/queries/user.queries';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    isPagination: boolean,
  ): Promise<paginationMeta> {
    const queryBuilder = buildFindAllUsersQuery(this.userRepository);

    if (isPagination) {
      const offset = getOffset(page, limit);
      queryBuilder.skip(offset).take(limit);
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    const result = getPageinationMeta({ items, page, limit, total });

    return result;
  }

  async findOne(id: string): Promise<User> {
    const user = await buildFindUserByIdQuery(this.userRepository, id).getOne();

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    return user;
  }

  async update(id: string, updateUserParams: updateUserParams): Promise<void> {
    const result = await buildUpdateUserByIdQuery(
      this.userRepository,
      id,
      updateUserParams,
    ).execute();

    if (result.affected === 0) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async remove(id: string): Promise<void> {
    await buildDeleteUserByIdQuery(this.userRepository, id).execute();
  }
}
