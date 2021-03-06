import { sign, verify, SignOptions, VerifyOptions, Secret, VerifyErrors, JwtPayload } from 'jsonwebtoken';

export const signJwtAsync = (payload: string | object | Buffer, secretOrPrivateKey: Secret, options?: SignOptions) => {
  return new Promise<string>((resolve, reject) => {
    sign(payload, secretOrPrivateKey, options, (err: Error, encoded: string) => {
      if (err)
        reject(err);
      resolve(encoded);
    });
  });
}

export const verifyJwtAsync = <T>(token: string, secretOrPublicKey: Secret, options?: VerifyOptions) => {
  return new Promise<T>((resolve, reject) => {
    verify(token, secretOrPublicKey, options, (err: VerifyErrors, decoded: T) => {
      if (err)
        reject(err);
      resolve(decoded);
    });
  });
}