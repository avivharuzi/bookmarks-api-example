import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(): string {
    return 'I am signed up!';
  }

  signup(): string {
    return 'I am signed in!';
  }
}
