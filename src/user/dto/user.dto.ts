import { ApiProperty } from '@nestjs/swagger';
import { updateUserParams } from '../user-types';
import { IsNotEmpty, MinLength } from 'class-validator';
import { TrimString } from 'src/modules/decorators/trim-string.decorator';

export class UpdateUserDto implements updateUserParams {
  @ApiProperty({
    example: 'john_doe',
    description: 'username you wish to have',
  })
  @MinLength(5, {
    message: 'Username must be longer than or equal to $constraint1 characters',
  })
  @IsNotEmpty()
  @TrimString()
  readonly userName: string;

  @ApiProperty({
    example: 'john',
    description: 'Your firstname',
  })
  @IsNotEmpty()
  @TrimString()
  readonly firstName: string;

  @ApiProperty({
    example: 'doe',
    description: 'Your lastname',
  })
  @IsNotEmpty()
  @TrimString()
  readonly lastName: string;
}
