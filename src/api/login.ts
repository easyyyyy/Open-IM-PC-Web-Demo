import { request } from "../utils";

export const sendSms = (phoneNumber:string):Promise<unknown> => {
    return request.post('/auth/code',JSON.stringify({phoneNumber}))
}

export const verifyCode = (phoneNumber:string,verificationCode:string) => {
    return request.post('/auth/verify',JSON.stringify({phoneNumber,verificationCode}))
}

export const register = (phoneNumber:string,verificationCode:string,password:string) => {
    return request.post('/auth/password',JSON.stringify({phoneNumber,verificationCode,password}))
}

export const login = (phoneNumber:string,password:string) => {
    return request.post('/auth/login',JSON.stringify({phoneNumber,password,platform:5}))
}