// @ts-nocheck
import COS from "cos-js-sdk-v5";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { request } from ".";
import { COSBUCKET, COSREGION, ADMINURL } from "../config";

export const cos = new COS({
  getAuthorization: function (options, callback) {
    var url = `${ADMINURL}/third/tencent_cloud_storage_credential`;
    request
      .post(url, {
        operationID: Date.now().toString(),
        token: "",
      })
      .then((res) => {
        const credentials = res.data.Credentials;
        callback({
          TmpSecretId: credentials.TmpSecretId,
          TmpSecretKey: credentials.TmpSecretKey,
          SecurityToken: credentials.Token,
          StartTime: res.data.StartTime,
          ExpiredTime: res.data.ExpiredTime,
        });
      });
  },
});

export const cosUploadNomal = (file: File, pcb?: COS.onProgress): Promise<COS.PutObjectResult & { url: string }> => {
  const dpcb = () => {};
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COSBUCKET /* 必须 */,
        Region: COSREGION /* 存储桶所在地域，必须字段 */,
        Key: "IMG" + file.lastModified + file.name /* 必须 */,
        // StorageClass: 'STANDARD',
        Body: file, // 上传文件对象
        onProgress: pcb ?? dpcb,
      },
      function (cerr, cdata) {
        if (cerr) {
          reject(cerr);
        } else {
          cdata.url = "https://" + cdata.Location;
          resolve(cdata);
        }
      }
    );
  });
};

export const cosUpload = (data: UploadRequestOption, pcb?: COS.onProgress): Promise<COS.PutObjectResult & { url: string }> => {
  const dpcb = () => {};
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COSBUCKET /* 必须 */,
        Region: COSREGION /* 存储桶所在地域，必须字段 */,
        //@ts-ignore
        Key: data.file.uid + data.file.name /* 必须 */,
        // StorageClass: 'STANDARD',
        Body: data.file, // 上传文件对象
        onProgress: pcb ?? dpcb,
      },
      function (cerr, cdata) {
        if (cerr) {
          reject(cerr);
        } else {
          cdata.url = "https://" + cdata.Location;
          resolve(cdata);
        }
      }
    );
  });
};

export const thumUpload = (file: File): Promise<COS.PutObjectResult & { url: string }> => {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: COSBUCKET /* 必须 */,
        Region: COSREGION /* 存储桶所在地域，必须字段 */,
        Key: file.name /* 必须 */,
        // StorageClass: 'STANDARD',
        Body: file, // 上传文件对象
        onProgress: () => {},
      },
      function (cerr, cdata) {
        if (cerr) {
          reject(cerr);
        } else {
          cdata.url = "https://" + cdata.Location;
          resolve(cdata);
        }
      }
    );
  });
};
