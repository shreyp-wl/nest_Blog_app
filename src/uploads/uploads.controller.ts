import {
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UPLOAD_ROUTES } from 'src/constants/routes';
import { ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FILE_NAME, MAX_UPLOAD_COUNT } from 'src/constants/upload.constants';
import { uploadOptions } from 'src/config/upload.config';
import { messageResponse } from 'src/utils/response.utils';
import { UploadMultipleResponse } from './uploads.response';
import { ApiSwaggerResponse } from 'src/modules/swagger/swagger.decorator';
import { StatusCodes } from 'http-status-codes';
import { MessageResponse } from 'src/modules/swagger/dtos/response.dtos';
import { SUCCESS_MESSAGES } from 'src/constants/messages.constants';
import { TransformWith } from 'src/modules/decorators/response-transformer.decorator';

@ApiTags(UPLOAD_ROUTES.UPLOAD)
@Controller(UPLOAD_ROUTES.UPLOAD)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseInterceptors(FilesInterceptor(FILE_NAME, MAX_UPLOAD_COUNT, uploadOptions))
  @Post(UPLOAD_ROUTES.CREATE_UPLOAD)
  @ApiSwaggerResponse(UploadMultipleResponse, {
    status: StatusCodes.CREATED,
  })
  @TransformWith(UploadMultipleResponse)
  @HttpCode(StatusCodes.CREATED)
  async uploadMultipleAttachment(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.uploadsService.uploadMultipleAttachments(files);
  }

  @Delete(UPLOAD_ROUTES.DELETE_UPLOAD)
  @ApiSwaggerResponse(MessageResponse)
  @TransformWith(MessageResponse)
  @HttpCode(StatusCodes.OK)
  async deleteSingleAttachment(
    @Param('folder') folder: string,
    @Param('id') id: string,
  ) {
    const publicId = `${folder}/${id}`;
    await this.uploadsService.deleteSingleAttachment(publicId);
    return messageResponse(SUCCESS_MESSAGES.DELETED);
  }
}
