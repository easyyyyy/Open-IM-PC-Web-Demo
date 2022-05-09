// export const AXIOSURL = "http://47.112.160.66:42233"
export const AXIOSURL = "http://124.222.64.28:42233"
// export const AXIOSURL = "http://43.128.5.63:42233"
export const AXIOSTIMEOUT = 60000
// export const IMURL = "ws://172.16.8.136:30000"
export const IMURL = "ws://124.222.64.28:30000"
export const ADMINURL = "http://124.222.64.28:10000"
// export const ADMINURL = "http://43.128.5.63:10000"
// export const IMURL = "ws://43.128.5.63:30000"
// export const IMURL = "ws://172.16.8.136:30000"
// export const IMURL = "ws://47.112.160.66:30000"
export const COSBUCKET = "echat-1302656840"
export const COSREGION = "ap-chengdu"
export const PICMESSAGETHUMOPTION = "?imageView2/1/w/200/h/200/rq/80"
export const LANGUAGE = "zh-cn"

export const getIMUrl = () => localStorage.getItem("IMUrl")?localStorage.getItem("IMUrl")!:IMURL
export const getAxiosUrl = () => localStorage.getItem("IMAxiosUrl")?localStorage.getItem("IMAxiosUrl")!:AXIOSURL
export const getAdminUrl = () => localStorage.getItem("IMAdminUrl")?localStorage.getItem("IMAdminUrl")!:ADMINURL
export const getLanguage = () => localStorage.getItem("IMLanguage")?localStorage.getItem("IMLanguage")!:LANGUAGE