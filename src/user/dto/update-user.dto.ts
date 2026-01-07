import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { updateUserParams } from '../user-types';

export class UpdateUserDto implements updateUserParams {
  @ApiProperty({
    example: 'john_doe',
    description: 'username you wish to have',
  })
  @MinLength(5, {
    message: 'Username must be longer than or equal to $constraint1 characters',
  })
  readonly username: string;

  @ApiProperty({
    example: 'john',
    description: 'Your firstname',
  })
  @IsNotEmpty()
  readonly firstname: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'doe',
    description: 'Your lastname',
  })
  readonly lastname: string;
}
