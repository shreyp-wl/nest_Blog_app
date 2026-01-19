import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogpostEntity } from 'src/modules/database/entities/blogpost.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/constants/messages.constants';
import { generateSlug } from 'src/utils/blogpost.utils';
import { SORT_ORDER, SORTBY } from 'src/common/enums';
import {
  paginationInput,
  paginationMeta,
} from 'src/common/interfaces/pagination.interfaces';
import {
  BLOG_POST_SELECT,
  GET_COMMENTS_ON_POST_SELECT,
} from './blogpost.constants';

import {
  getOffset,
  getPageinationMeta,
} from 'src/common/helper/pagination.helper';
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './interfaces/blogpost.interface';
import { BLOG_POST_STATUS } from './blogpost-types';
import { COMMENT_STATUS } from 'src/comments/comments-types';
import { CommentEntity } from 'src/modules/database/entities/comment.entity';
import { findExistingEntity } from 'src/utils/db.utils';

@Injectable()
export class BlogpostService {
  constructor(
    @InjectRepository(BlogpostEntity)
    private readonly blogPostRepository: Repository<BlogpostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async create(createBlogPostInput: CreateBlogPostInput): Promise<void> {
    const existing = await this.blogPostRepository.exists({
      where: { title: createBlogPostInput.title },
    });

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.CONFLICT);
    }

    const blogPost = this.blogPostRepository.create(createBlogPostInput);
    const slug = generateSlug(blogPost.title, blogPost.id);

    blogPost.slug = slug;

    await this.blogPostRepository.save(blogPost);
  }

  async findAll(
    page: number,
    limit: number,
    isPagination: boolean,
  ): Promise<paginationMeta> {
    const queryBuilder = this.blogPostRepository
      .createQueryBuilder('post')
      .select(BLOG_POST_SELECT)
      .orderBy(`post.${SORTBY.CREATED_AT}`, SORT_ORDER.DESC);

    if (isPagination) {
      const offset = getOffset(page, limit);
      queryBuilder.skip(offset).take(limit);
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    const result = getPageinationMeta({ items, page, limit, total });

    return result;
  }

  findOne(id: number) {
    return `This action returns a #${id} blogpost`;
  }

  async update(id: string, updateBlogPostInput: UpdateBlogPostInput) {
    const result = await this.blogPostRepository.preload({
      id: id,
      ...updateBlogPostInput,
    });

    if (!result) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    const newSlug = generateSlug(updateBlogPostInput.title, id);
    result.slug = newSlug;

    await this.blogPostRepository.save(result);
  }

  async remove(id: string) {
    const blogPost = await this.blogPostRepository.findOne({
      where: {
        id,
      },
    });

    if (!blogPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.blogPostRepository.softRemove(blogPost);
  }

  async publish(id: string) {
    const blogPost = await this.blogPostRepository.preload({
      id,
      status: BLOG_POST_STATUS.PUBLISHED,
    });

    if (!blogPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.blogPostRepository.save(blogPost);
  }

  async processComment(commentId: string, isApproved: boolean) {
    const status = isApproved
      ? COMMENT_STATUS.APPROVED
      : COMMENT_STATUS.REJECTED;
    const comment = await this.commentRepository.preload({
      id: commentId,
      status,
    });
    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    await this.commentRepository.save(comment);
  }

  async getCommentsOnPost(
    id: string,
    { page, limit, isPagination }: paginationInput,
  ) {
    const existingPost = await findExistingEntity(this.blogPostRepository, {
      id,
    });
    if (!existingPost) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'author')
      .select(GET_COMMENTS_ON_POST_SELECT)
      .where('comment.postId = :id', { id })
      .andWhere('comment.status = :status', {
        status: COMMENT_STATUS.APPROVED,
      });

    if (isPagination) {
      const skip = getOffset(page, limit);
      qb.skip(skip).limit(limit);
    }

    const [items, total] = await qb.getManyAndCount();
    const result = getPageinationMeta({ items, page, limit, total });
    return result;
  }
}
