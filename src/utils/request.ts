import { message } from 'antd'
import axios, { AxiosError } from 'axios'
import { AXIOSTIMEOUT, AXIOSURL } from '../config'


const request = axios.create({
  timeout: AXIOSTIMEOUT,
  baseURL: AXIOSURL,
})

function handleError(error: AxiosError) {

  return Promise.reject(error)
}

request.interceptors.request.use( (config) => {
  return config;
}, function (error) {
  return Promise.reject(error);
});

request.interceptors.response.use( (response) => {
  const res = response.data
  if(res.errCode===0 || res.errCode===10007){
    return res;
  }else{
    message.error(res.errMsg || '操作失败，请稍后再试！');
    // return Promise.reject(new Error(res.errMsg || '操作失败，请稍后再试！'))
    return Promise.reject('操作失败，请稍后再试！')
  }
  
}, handleError);

export default request
