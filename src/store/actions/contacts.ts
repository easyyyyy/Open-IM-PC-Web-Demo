import { Dispatch } from "redux";
import { FriendApplication, FriendItem, GroupApplication, GroupItem, UserInfo } from "../../@types/open_im";
import { im } from "../../utils";
import {
  ContactActionTypes,
  SET_BLACK_LIST,
  SET_FRIEND_APPLICATION_LIST,
  SET_FRIEND_LIST,
  SET_GROUP_APPLICATION_LIST,
  SET_GROUP_LIST,
  SET_ORIGIN_LIST,
  SET_UNREAD_COUNT,
} from "../types/contacts";

export const setFriendList = (value: FriendItem[]): ContactActionTypes => {
  return {
    type: SET_FRIEND_LIST,
    payload: value,
  };
};

export const setOriginList = (value: FriendItem[]): ContactActionTypes => {
  return {
    type: SET_ORIGIN_LIST,
    payload: value,
  };
};

export const setGroupList = (value: GroupItem[]): ContactActionTypes => {
  
  return {
    type: SET_GROUP_LIST,
    payload: value,
  };
};

export const setBlackList = (value: UserInfo[]): ContactActionTypes => {
  return {
    type: SET_BLACK_LIST,
    payload: value,
  };
};

export const setFriendApplicationList = (value: FriendApplication[]): ContactActionTypes => {
  
  return {
    type: SET_FRIEND_APPLICATION_LIST,
    payload: value,
  };
};

export const setGroupApplicationList = (value: GroupApplication[]): ContactActionTypes => {
  
  return {
    type: SET_GROUP_APPLICATION_LIST,
    payload: value,
  };
};

export const setUnReadCount = (value: number): ContactActionTypes => {
  return {
    type: SET_UNREAD_COUNT,
    payload: value,
  };
};

export const getFriendList = () => {
  return (dispatch: Dispatch) => {
    im.getFriendList().then((res) =>
      dispatch(setFriendList(JSON.parse(res.data)))
    );
  };
};

export const getGroupList = () => {
  return (dispatch: Dispatch) => {
    im.getJoinedGroupList().then((res) =>
      dispatch(setGroupList(JSON.parse(res.data)))
    );
  };
};

export const getBlackList = () => {
  return (dispatch: Dispatch) => {
    im.getBlackList().then((res) =>
      dispatch(setBlackList(JSON.parse(res.data)))
    );
  };
};

export const getFriendApplicationList = () => {
  return (dispatch: Dispatch) => {
    im.getFriendApplicationList().then((res) =>
      dispatch(setFriendApplicationList(JSON.parse(res.data)))
    );
  };
};

export const getGroupApplicationList = () => {
  return (dispatch: Dispatch) => {
    im.getGroupApplicationList().then((res) =>
      dispatch(setGroupApplicationList(JSON.parse(res.data).user))
    );
  };
};

export const getUnReadCount = () => {
  return (dispatch:Dispatch) => {
    im.getTotalUnreadMsgCount().then(res=>{
      dispatch(setUnReadCount(Number(res.data)))
    })
  }
}
