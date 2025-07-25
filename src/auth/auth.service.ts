import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordHashingService } from './password-hashing.service';
import { JWTService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly jwtService: JWTService,
  ) {}

  async getAllUses() {
    return this.userRepo.find();
  }

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userRepo.findOneBy({ email });
    if (user) {
      throw new BadRequestException(
        `User with this ${email} already exist in our database`,
      );
    }

    const hashedPassword =
      await this.passwordHashingService.hashPassword(password);

    const newUser = await this.userRepo.save({
      name,
      email,
      password: hashedPassword,
    });
    return newUser;
  }

  async signIn(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new BadRequestException(
        'User with this email is not registerd in our system',
      );
    }

    const isPasswordMatched = await !this.passwordHashingService.verifyPassword(
      password,
      user.password,
    );

    if (isPasswordMatched) throw new BadRequestException('Invalid password');

    const jwtToken = this.jwtService.generateJwtToken(user.id, email);

    user.token = jwtToken;

    await this.userRepo.save(user);

    return user;
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException(
        'User with this email is not registerd in our system',
      );
    }

    const isPasswordMatched = await !this.passwordHashingService.verifyPassword(
      oldPassword,
      user.password,
    );

    if (isPasswordMatched) throw new BadRequestException('Invalid password');

    const hashedPassword =
      await this.passwordHashingService.hashPassword(newPassword);

    user.password = hashedPassword;

    await this.userRepo.save(user);

    return user;
  }

  async logout(email: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new BadRequestException(
        'User with this email is not registerd in our system',
      );
    }

    user.token = '';

    await this.userRepo.save(user);

    return { message: 'User is logout successfully' };
  }
}
