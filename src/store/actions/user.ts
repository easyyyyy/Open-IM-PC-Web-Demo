import { Dispatch } from "redux";
import { UserInfo } from "../../@types/open_im";
import { getAuthToken } from "../../api/admin";
import { im } from "../../utils";
import {
  SET_SELF_INFO,
  SET_SELF_INIT_LOADING,
  SET_ADMIN_TOKEN,
  UserActionTypes,
} from "../types/user";

export const setSelfInfo = (value: UserInfo): UserActionTypes => {
  return {
    type: SET_SELF_INFO,
    payload: value,
  };
};

export const setSelfToken = (value: string): UserActionTypes => {
  return {
    type: SET_ADMIN_TOKEN,
    payload: value,
  };
};

export const setSelfInitLoading = (value: boolean): UserActionTypes => {
  return {
    type: SET_SELF_INIT_LOADING,
    payload: value,
  };
};

export const getSelfInfo = (uid: string) => {
  return (dispatch: Dispatch) => {
    dispatch(setSelfInitLoading(true));
    im.getUsersInfo([uid]).then((res) => {
      dispatch(setSelfInfo(JSON.parse(res.data)[0]));
      dispatch(setSelfInitLoading(false));
    });
  };
};

export const getAdminToken = (uid?:string,secret?:string) => {
  return (dispatch: Dispatch) => {
    getAuthToken(uid,secret).then(res=>{
      dispatch(setSelfToken(res.data.token))
    })
  }
}