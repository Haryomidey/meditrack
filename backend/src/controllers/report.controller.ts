import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as reportService from '../services/report.service';

const scope = (req: Request) => ({
  pharmacyId: req.user!.pharmacyId,
  branchId: req.user!.branchId,
});

export const getDailyReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.salesSummary(scope(req), 'daily');
  res.status(StatusCodes.OK).json({ data: report });
});

export const getWeeklyReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.salesSummary(scope(req), 'weekly');
  res.status(StatusCodes.OK).json({ data: report });
});

export const getMonthlyReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.salesSummary(scope(req), 'monthly');
  res.status(StatusCodes.OK).json({ data: report });
});

export const getLowStockReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.lowStockReport(scope(req));
  res.status(StatusCodes.OK).json({ data: report });
});

export const getExpiringReport = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 90;
  const report = await reportService.expiringReport(scope(req), days);
  res.status(StatusCodes.OK).json({ data: report });
});
