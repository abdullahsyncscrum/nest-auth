import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  getAllUsers() {
    return this.authService.getAllUses();
  }

  @Post('/register')
  registerUser(@Body() userInfo: CreateUserDto) {
    return this.authService.createUser(
      userInfo.name,
      userInfo.email,
      userInfo.password,
    );
  }

  @Post('/signin')
  login(@Body() userPayload: LoginUserDto) {
    return this.authService.signIn(userPayload.email, userPayload.password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-password')
  updatePassword(@Req() req, @Body() userPayload: UpdatePasswordDto) {
    return this.authService.updatePassword(
      req.user.id,
      userPayload.oldPassword,
      userPayload.newPassword,
    );
  }

  @Get('/logout')
  logout(@Req() req) {
    return this.authService.logout(req.email);
  }
}
