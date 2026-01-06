// src/users/dto/login-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export interface createUserParams {
  email: string;
  password: string;
}

export class CreateUserDto implements createUserParams {
  @ApiProperty({
    example: 'john_doe@email.com',
    description: 'email of user',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  readonly email: string;

  @ApiProperty({
    example: 'your_secret_password',
    description: 'password of user',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  readonly password: string;
}
