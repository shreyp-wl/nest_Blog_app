import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TrimString } from 'src/modules/decorators/trim-string.decorator';

export class LoginUserDto {
  @ApiProperty({
    example: 'john_doe@email.com',
    nullable: false,
    required: true,
    description: 'Email of user',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty()
  @TrimString()
  readonly email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @ApiProperty({
    example: 'your_secret_password',
    nullable: false,
    required: true,
    description: 'Password of user',
  })
  @IsNotEmpty()
  @TrimString()
  readonly password: string;
}

export class CreateUserDto {
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

  @ApiProperty({
    example: 'john_doe@email.com',
    description: 'email of user',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty()
  @TrimString()
  readonly email: string;

  @ApiProperty({
    example: 'your_secret_password',
    description: 'password of user',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty()
  @TrimString()
  readonly password: string;
}
