import { ContactActionTypes, ContactState, SET_FRIEND_APPLICATION_LIST, SET_FRIEND_LIST, SET_GROUP_APPLICATION_LIST, SET_GROUP_LIST, SET_ORIGIN_LIST, SET_UNREAD_COUNT } from "../types/contacts";

let initialState: ContactState = {
    friendList:[],
    originList:[],
    groupList:[],
    friendApplicationList:[],
    groupApplicationList:[],
    unReadCount:0
  };
  
  const lastUid = localStorage.getItem('lastimuid') || ''
  const lastConsStore = localStorage.getItem(`${lastUid}consStore`)
  if(lastConsStore){
    initialState = JSON.parse(lastConsStore!)
  }

  export const friendReducer = (
    state = initialState,
    action: ContactActionTypes
  ): ContactState => {
    switch (action.type) {
      case SET_FRIEND_LIST:
        return { ...state, friendList: action.payload };
      case SET_ORIGIN_LIST:
        return { ...state, originList: action.payload };
      case SET_GROUP_LIST:
        return { ...state, groupList: action.payload };
      case SET_FRIEND_APPLICATION_LIST:
        return { ...state, friendApplicationList: action.payload };
      case SET_GROUP_APPLICATION_LIST:
        return { ...state, groupApplicationList: action.payload };
      case SET_UNREAD_COUNT:
        return { ...state, unReadCount: action.payload };
      default:
        return state;
    }
  };