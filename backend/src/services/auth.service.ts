import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { parseDurationToMs } from '../utils/time';
import { env } from '../config/env';
import { UserModel, UserRole } from '../models/user.model';
import { PharmacyModel } from '../models/pharmacy.model';
import { BranchModel } from '../models/branch.model';
import { RefreshTokenModel } from '../models/refresh-token.model';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  pharmacyName: string;
  branchName: string;
  branchCode: string;
}

interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
}

const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const issueTokens = async (user: { _id: Types.ObjectId; pharmacyId: Types.ObjectId; branchId?: Types.ObjectId; role: UserRole }, deviceId?: string) => {
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    pharmacyId: user.pharmacyId.toString(),
    branchId: user.branchId?.toString(),
    role: user.role,
  });

  const refreshToken = signRefreshToken({ userId: user._id.toString() });
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwtRefreshExpiresIn));

  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    deviceId,
  });

  return { accessToken, refreshToken };
};

export const signup = async (input: SignupInput) => {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already in use', StatusCodes.CONFLICT);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const passwordHash = await bcrypt.hash(input.password, 12);

    const pharmacy = await PharmacyModel.create(
      [
        {
          name: input.pharmacyName,
        },
      ],
      { session },
    );

    const branch = await BranchModel.create(
      [
        {
          pharmacyId: pharmacy[0]._id,
          name: input.branchName,
          code: input.branchCode,
        },
      ],
      { session },
    );

    const user = await UserModel.create(
      [
        {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role: 'Owner',
          pharmacyId: pharmacy[0]._id,
          branchId: branch[0]._id,
        },
      ],
      { session },
    );

    pharmacy[0].ownerUserId = user[0]._id;
    await pharmacy[0].save({ session });

    await session.commitTransaction();
    session.endSession();

    const tokens = await issueTokens(user[0]);

    return {
      user: {
        id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
        pharmacyId: user[0].pharmacyId,
        branchId: user[0].branchId,
      },
      ...tokens,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const login = async (input: LoginInput) => {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const tokens = await issueTokens(user, input.deviceId);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacyId,
      branchId: user.branchId,
    },
    ...tokens,
  };
};

export const refresh = async (token: string) => {
  const tokenHash = hashRefreshToken(token);

  const dbToken = await RefreshTokenModel.findOne({
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!dbToken) {
    throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
  }

  const user = await UserModel.findById(dbToken.userId);
  if (!user || !user.isActive) {
    throw new AppError('User not available', StatusCodes.UNAUTHORIZED);
  }

  dbToken.revokedAt = new Date();
  await dbToken.save();

  return issueTokens(user, dbToken.deviceId);
};

export const logout = async (token: string): Promise<void> => {
  const tokenHash = hashRefreshToken(token);
  await RefreshTokenModel.updateOne(
    { tokenHash, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  );
};
