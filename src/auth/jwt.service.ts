import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTService {
  generateJwtToken(userId: number, email: string) {
    return jwt.sign({ userId, email }, 'secret', {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: 86400,
    });
  }
}
