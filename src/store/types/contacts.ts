import { FriendApplication, FriendItem, GroupApplication, GroupItem } from "../../@types/open_im"

export type ContactState = {
    friendList:FriendItem[]
    originList:FriendItem[]
    groupList:GroupItem[]
    friendApplicationList:FriendApplication[]
    groupApplicationList:GroupApplication[]
    unReadCount:number
}

export const SET_FRIEND_LIST = 'SET_FRIEND_LIST'
export const SET_ORIGIN_LIST = 'SET_ORIGIN_LIST'
export const SET_GROUP_LIST = 'SET_GROUP_LIST'
export const SET_FRIEND_APPLICATION_LIST = 'SET_FRIEND_APPLICATION_LIST'
export const SET_GROUP_APPLICATION_LIST = 'SET_GROUP_APPLICATION_LIST'
export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT'

type SetFriendList = {
    type: typeof SET_FRIEND_LIST
    payload: FriendItem[]
}

type SetOriginList = {
    type: typeof SET_ORIGIN_LIST
    payload: FriendItem[]
}

type SetFriendApplicationList = {
    type: typeof SET_FRIEND_APPLICATION_LIST
    payload: FriendApplication[]
}

type SetGroupList = {
    type: typeof SET_GROUP_LIST
    payload: GroupItem[]
}

type SetGroupApplicationList = {
    type: typeof SET_GROUP_APPLICATION_LIST
    payload: GroupApplication[]
}

type SetUnReadCount = {
    type: typeof SET_UNREAD_COUNT
    payload: number
}

export type ContactActionTypes = SetFriendList | SetOriginList | SetFriendApplicationList | SetGroupList | SetGroupApplicationList | SetUnReadCount