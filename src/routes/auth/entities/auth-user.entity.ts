import { User } from '../../../models';

export class AuthUser extends User {
  isGuest?: boolean;
}