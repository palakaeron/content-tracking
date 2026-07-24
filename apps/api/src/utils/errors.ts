import type { NextFunction, Request, Response } from 'express';
export class AppError extends Error { constructor(public status:number, public code:string, message:string, public details?:unknown){super(message)} }
export const asyncHandler=(fn:(req:Request,res:Response,next:NextFunction)=>Promise<unknown>)=>(req:Request,res:Response,next:NextFunction)=>Promise.resolve(fn(req,res,next)).catch(next);
export function errorHandler(err:unknown,req:Request,res:Response,_next:NextFunction){ const e=err instanceof AppError?err:new AppError(500,'INTERNAL_ERROR','An unexpected error occurred'); req.log.error({err,requestId:req.id},'request failed'); res.status(e.status).json({success:false,error:{code:e.code,message:e.message,details:e.details}}); }
