import type { CookieOptions } from 'express';

export const refreshTokenConfig: CookieOptions = {
  maxAge: 900000,
  httpOnly: true,
  secure: false, //dev
  path: '/',
};

export const accessTokenConfig: CookieOptions = {
  maxAge: 900000,
  httpOnly: true,
  secure: false, //dev
  path: '/',
};
