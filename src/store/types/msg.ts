import { Message } from "../../@types/open_im"

export type MsgState = {
    historyMsgList:Message[]
}

export const SET_HISTORY_MSGLIST = 'SET_HISTORY_MSGLIST'


type SetHistoryMsgList = {
    type: typeof SET_HISTORY_MSGLIST
    payload: Message[]
}


export type MsgActionTypes = SetHistoryMsgList