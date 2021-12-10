import { request } from "../utils";

export const sendSms = (phoneNumber:string):Promise<unknown> => request.post('/auth/code',JSON.stringify({phoneNumber}))

export const verifyCode = (phoneNumber:string,verificationCode:string) => request.post('/auth/verify',JSON.stringify({phoneNumber,verificationCode}))

export const register = (phoneNumber:string,verificationCode:string,password:string) => request.post('/auth/password',JSON.stringify({phoneNumber,verificationCode,password}))

export const login = (phoneNumber:string,password:string) => request.post('/auth/login',JSON.stringify({phoneNumber,password,platform:5}))
