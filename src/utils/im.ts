// import { OpenIMSDK } from 'open-im-sdk'
import { Cve } from '../@types/open_im';
import { OpenIMSDK } from './open_im_sdk'

const im = new OpenIMSDK()

//utils
const isSingleCve = (cve:Cve) => {
    return cve.userID!==''&&cve.groupID===''
}


export {im,isSingleCve};