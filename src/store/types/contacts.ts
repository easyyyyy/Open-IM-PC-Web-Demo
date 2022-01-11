import { FriendApplication, FriendItem, GroupApplication, GroupItem, GroupMember, MemberMapType, UserInfo } from "../../@types/open_im";

export type ContactState = {
  friendList: FriendItem[];
  originList: FriendItem[];
  groupList: GroupItem[];
  blackList: UserInfo[];
  friendApplicationList: FriendApplication[];
  groupApplicationList: GroupApplication[];
  groupMemberList: GroupMember[];
  groupMemberLoading: boolean;
  member2status: MemberMapType;
  unReadCount: number;
};

export const SET_FRIEND_LIST = "SET_FRIEND_LIST";
export const SET_ORIGIN_LIST = "SET_ORIGIN_LIST";
export const SET_GROUP_LIST = "SET_GROUP_LIST";
export const SET_BLACK_LIST = "SET_BLACK_LIST";
export const SET_FRIEND_APPLICATION_LIST = "SET_FRIEND_APPLICATION_LIST";
export const SET_GROUP_APPLICATION_LIST = "SET_GROUP_APPLICATION_LIST";
export const SET_GROUP_MEMBER_LIST = "SET_GROUP_MEMBER_LIST";
export const SET_GROUP_MEMBER_LOADING = "SET_GROUP_MEMBER_LOADING";
export const SET_MEMBER2STATUS = "SET_MEMBER2STATUS";
export const SET_UNREAD_COUNT = "SET_UNREAD_COUNT";

type SetFriendList = {
  type: typeof SET_FRIEND_LIST;
  payload: FriendItem[];
};

type SetOriginList = {
  type: typeof SET_ORIGIN_LIST;
  payload: FriendItem[];
};

type SetFriendApplicationList = {
  type: typeof SET_FRIEND_APPLICATION_LIST;
  payload: FriendApplication[];
};

type SetGroupList = {
  type: typeof SET_GROUP_LIST;
  payload: GroupItem[];
};

type SetbBlackList = {
  type: typeof SET_BLACK_LIST;
  payload: UserInfo[];
};

type SetGroupApplicationList = {
  type: typeof SET_GROUP_APPLICATION_LIST;
  payload: GroupApplication[];
};

type SetGroupMemberList = {
  type: typeof SET_GROUP_MEMBER_LIST;
  payload: GroupMember[];
};

type SetGroupMemberLoading = {
  type: typeof SET_GROUP_MEMBER_LOADING;
  payload: boolean;
};


type SetMember2Status = {
  type: typeof SET_MEMBER2STATUS;
  payload: MemberMapType;
};

type SetUnReadCount = {
  type: typeof SET_UNREAD_COUNT;
  payload: number;
};

export type ContactActionTypes =
  | SetFriendList
  | SetOriginList
  | SetFriendApplicationList
  | SetGroupList
  | SetGroupApplicationList
  | SetUnReadCount
  | SetbBlackList
  | SetMember2Status
  | SetGroupMemberList
  | SetGroupMemberLoading;
