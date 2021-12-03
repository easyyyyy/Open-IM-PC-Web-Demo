import { SelfInfo } from "../../@types/open_im"

export type UserState = {
    selfInfo:SelfInfo
    selfToken:string
    selfInitLoading:boolean
}

export const SET_SELF_INFO = 'SET_SELF_INFO'
export const SET_SELF_TOKEN = 'SET_SELF_TOKEN'
export const SET_SELF_INIT_LOADING = 'SET_SELF_INIT_LOADING'

type SetSelfInfo = {
    type: typeof SET_SELF_INFO
    payload: SelfInfo
}

type SetSelfToken = {
    type: typeof SET_SELF_TOKEN
    payload: string
}

type SetSelfInitLoading = {
    type: typeof SET_SELF_INIT_LOADING
    payload: boolean
}


export type UserActionTypes = SetSelfInfo | SetSelfToken | SetSelfInitLoading