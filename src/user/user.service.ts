import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FindAllUsersResponse } from './user.response';
import { updateUserParams } from '../../dist/user/user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(page: number, limit: number): Promise<FindAllUsersResponse> {
    const offset = (page - 1) * limit;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const [result, total] = await queryBuilder
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.username',
        'user.firstname',
        'user.lastname',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data: result,
      meta: {
        totalItems: total,
        itemsCount: result.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .select([
        'user.id',
        'user.email',
        'user.role',
        'user.username',
        'user.firstname',
        'user.lastname',
      ])
      .where('user.id = :id', {
        id,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('No user found with provided userid');
    }

    return user;
  }

  async update(id: string, updateUserParams: updateUserParams): Promise<void> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const result = await queryBuilder
      .update({
        ...updateUserParams,
        updatedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    await queryBuilder
      .update(User)
      .set({ isDeleted: true, deletedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id })
      .execute();
  }
}
