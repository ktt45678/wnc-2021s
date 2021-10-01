import { getModelForClass } from '@typegoose/typegoose';

import { User } from './user.model';
import { UserRequest } from './user-request.model';

export {
  User,
  UserRequest
}

export const userModel = getModelForClass(User);
export const userRequestModel = getModelForClass(UserRequest);