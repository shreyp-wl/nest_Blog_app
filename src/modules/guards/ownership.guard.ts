import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogpostEntity } from '../database/entities/blogpost.entity';
import { Repository } from 'typeorm';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ERROR_MESSAGES } from 'src/constants/messages.constants';
import { UserEntity } from '../database/entities/user.entity';
import { USER_ROLES } from 'src/user/user-types';
import { OWNERSHIP_GUARD_BLOG_POST_SELECT } from 'src/blogpost/blogpost.constants';
import { OWNERSHIP_GUARD_USER_SELECT } from 'src/user/user.constants';

export class OwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(BlogpostEntity)
    private readonly blogPostRepository: Repository<BlogpostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user: decoded } = request;
    const { id: postId } = request.params;

    if (!decoded?.id) {
      throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(OWNERSHIP_GUARD_USER_SELECT)
      .where('user.id = :id', {
        id: decoded.id,
      })
      .getOne();

    const post = await this.blogPostRepository
      .createQueryBuilder('post')
      .select(OWNERSHIP_GUARD_BLOG_POST_SELECT)
      .where('post.id = :id', {
        id: postId,
      })
      .getOne();

    if (!post) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    if (!user || user.role !== USER_ROLES.AUTHOR) {
      throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
    }

    //Only author of the post can publish it.
    if (post.authorId !== user.id) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    return true;
  }
}
