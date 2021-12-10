// @ts-nocheck
import COS from 'cos-js-sdk-v5'
import { UploadRequestOption } from 'rc-upload/lib/interface'
import { request } from '.';
import { COSBUCKET, COSREGION,COSAUTHORIZATIONURL } from '../config';

export const cos = new COS({
    // getAuthorization 必选参数
    getAuthorization: function (options, callback) {
        // 异步获取临时密钥

        var url = `${COSAUTHORIZATIONURL}/third/tencent_cloud_storage_credential`; // url替换成您自己的后端服务
        request.post(url,{
            operationID:Date.now().toString(),
            token:''
        }).then(res=>{
            console.log(res);
            const credentials = res.data.Credentials
            callback({
                      TmpSecretId: credentials.TmpSecretId,
                      TmpSecretKey: credentials.TmpSecretKey,
                      SecurityToken: credentials.Token,
                      // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                      StartTime: res.data.StartTime, // 时间戳，单位秒，如：1580000000
                      ExpiredTime: res.data.ExpiredTime, // 时间戳，单位秒，如：1580000000
                  });
        })
    }
});

export const cosUpload = (data:UploadRequestOption,pcb?:COS.onProgress):Promise<COS.PutObjectResult&{url:string}> => {
    const dpcb = () =>{}
    return new Promise((resolve,reject)=>{
        cos.putObject({
            Bucket: COSBUCKET, /* 必须 */
            Region: COSREGION,     /* 存储桶所在地域，必须字段 */
            //@ts-ignore
            Key: data.file.uid+data.file.name,              /* 必须 */
            // StorageClass: 'STANDARD',
            Body: data.file, // 上传文件对象
            onProgress: pcb??dpcb
        }, function(cerr, cdata) {
            if(cerr){
                reject(cerr)
            }else{
                cdata.url = "https://" + cdata.Location
                resolve(cdata)
            }
        });
    })
}

export const thumUpload = (file:File):Promise<COS.PutObjectResult&{url:string}> => {
    return new Promise((resolve,reject)=>{
        cos.putObject({
            Bucket: COSBUCKET, /* 必须 */
            Region: COSREGION,     /* 存储桶所在地域，必须字段 */
            Key: file.name,              /* 必须 */
            // StorageClass: 'STANDARD',
            Body: file, // 上传文件对象
            onProgress: ()=>{}
        }, function(cerr, cdata) {
            if(cerr){
                reject(cerr)
            }else{
                cdata.url = "https://" + cdata.Location
                resolve(cdata)
            }
        });
    })
}