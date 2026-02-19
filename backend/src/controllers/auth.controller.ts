import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';
import { verifyRefreshToken } from '../utils/jwt';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.signup(req.body);
  res.status(StatusCodes.CREATED).json(data);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  res.status(StatusCodes.OK).json(data);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken as string;
  verifyRefreshToken(refreshToken);
  const tokens = await authService.refresh(refreshToken);
  res.status(StatusCodes.OK).json(tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(StatusCodes.NO_CONTENT).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
});
