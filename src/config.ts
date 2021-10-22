export const PORT = process.env.PORT ?? 3000;
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const MONGO_URL = process.env.MONGO_URL ?? '';
export const REDIS_URL = process.env.REDIS_URL ?? '';
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_LIFETIME = NODE_ENV === 'development' ? 3600 : 300;
export const REFRESH_TOKEN_LIFETIME = 2592000;
export const WEBSITE_URL = process.env.WEBSITE_URL;
export const EMAIL_SENDER = process.env.EMAIL_SENDER;
export const EMAIL_FROM = process.env.EMAIL_FROM;
export const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;
export const USER_REQUEST_DURATION = 604800; // 7 days
export const DEFAULT_ACCOUNT_POINT = 10;
export const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
export const DISABLE_RECAPTCHA = !!process.env.DISABLE_RECAPTCHA;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;