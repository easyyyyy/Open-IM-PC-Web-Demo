import { request } from "../utils";

export const sendSms = (phoneNumber:string):Promise<unknown> => request.post('/auth/code',JSON.stringify({phoneNumber}))

export const verifyCode = (phoneNumber:string,verificationCode:string) => request.post('/auth/verify',JSON.stringify({phoneNumber,verificationCode}))

export const register = (phoneNumber:string,verificationCode:string,password:string) => request.post('/auth/password',JSON.stringify({phoneNumber,verificationCode,password}))

export const login = (phoneNumber:string,password:string) => {
    let platform = 5
    // if(window.electron){
    //     if(window.process.platform==="darwin"){
    //       platform = 4
    //     }else if(window.process.platform==="win32"){
    //       platform = 3
    //     }
    //   }
    return request.post('/auth/login',JSON.stringify({phoneNumber,password,platform}))
}
