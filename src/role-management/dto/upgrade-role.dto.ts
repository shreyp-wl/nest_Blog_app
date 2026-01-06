import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { userRoles } from 'src/user/user.types';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'specify role you wish to be promoted to',
    example: 'admin',
  })
  @IsEnum(userRoles, {
    message: 'Role must be either admin, reader, or author',
  })
  role: userRoles;
}
