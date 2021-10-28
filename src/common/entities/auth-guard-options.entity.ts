/**
 * @class AuthGuardOptions Set options for auth guard middleware
 * @param allowGuest {boolean} allow people without access token
 * @param roles {string[]} whitelisted roles
 */
export class AuthGuardOptions {
  allowGuest?: boolean;
  roles?: string[];
}