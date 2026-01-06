import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthUtils } from 'src/utils/auth.utils';
import { Repository } from 'typeorm';
import { createUserParams } from '../user/dto/create-user.dto';
import { loginUserParams } from '../user/dto/login-user.dto';

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
  async login(loginUserParams: loginUserParams): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      select: ['email', 'password'],
      where: { email: loginUserParams.email },
    });

    if (!user) {
      throw new NotFoundException('No user exists with provided email');
    }

    const validPassword = await this.authUtils.validatePassword(
      loginUserParams.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('You entered wrong password');
    }

    const accessToken = this.authUtils.generateAccessToken({
      email: loginUserParams.email,
      password: loginUserParams.password,
    });

    const refreshToken = this.authUtils.generateRefreshToken({
      email: loginUserParams.email,
      password: loginUserParams.password,
    });

    user.refreshToken = refreshToken;
    await this.userRepository.update(
      { email: user.email },
      { refreshToken: refreshToken },
    );

    return { accessToken, refreshToken };
  }

  async register(
    createUserParams: createUserParams,
  ): Promise<createUserParams> {
    let user = new User();

    const hashedPassword = await this.authUtils.hashPassword(
      createUserParams.password,
    );
    user.email = createUserParams.email;
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
