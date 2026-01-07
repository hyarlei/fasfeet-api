import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  cpf: string;
  role: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
