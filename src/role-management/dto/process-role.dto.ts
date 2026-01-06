import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class processRoleApprovalRequestDto {
  @ApiProperty({
    description: 'Specify whethere you wish to approve or reject the reqeust',
    example: true,
  })
  @IsBoolean({
    message: 'Role approval status can not be empty',
  })
  isApproved: boolean;
}
