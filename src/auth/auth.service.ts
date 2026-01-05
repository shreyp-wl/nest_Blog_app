import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthUtils } from 'src/utils/auth.utils';
import { Repository } from 'typeorm';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authUtils: AuthUtils,
  ) {}
  //login endpoint
  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      select: ['email', 'password'],
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new NotFoundException('No user exists with provided email');
    }

    const validPassword = await this.authUtils.validatePassword(
      loginUserDto.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('You entered wrong password');
    }

    const accessToken = this.authUtils.generateAccessToken({
      email: loginUserDto.email,
      password: loginUserDto.password,
    });

    const refreshToken = this.authUtils.generateRefreshToken({
      email: loginUserDto.email,
      password: loginUserDto.password,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.update(
      { email: user.email },
      { refreshToken: refreshToken },
    );

    return { accessToken, refreshToken };
  }

  async register(createUserDto: CreateUserDto): Promise<CreateUserDto> {
    let user = new User();

    const hashedPassword = await this.authUtils.hashPassword(
      createUserDto.password,
    );
    user.email = createUserDto.email;
    user.password = hashedPassword;
    user = await this.userRepository.save(user);

    return user;
  }

  async refresh(receivedRefreshToken: string): Promise<AuthResponse> {
    const userPayload = this.authUtils.decodeToken(receivedRefreshToken);
    const { email, password } = userPayload;

    const accessToken = this.authUtils.generateAccessToken({ email, password });
    const refreshToken = this.authUtils.generateRefreshToken({
      email,
      password,
    });

    await this.userRepository.update(
      { email: userPayload.email },
      {
        refreshToken,
      },
    );

    return { accessToken, refreshToken };
  }
}
