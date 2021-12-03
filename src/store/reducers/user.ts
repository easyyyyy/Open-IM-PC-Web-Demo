import { SET_SELF_INFO, SET_SELF_INIT_LOADING, SET_SELF_TOKEN, UserActionTypes, UserState } from "../types/user";

let initialState: UserState = {
    selfInfo:{},
    selfToken:"",
    selfInitLoading:true
  };

  const lastUid = localStorage.getItem('lastimuid') || ''
  const lastUserStore = localStorage.getItem(`${lastUid}userStore`)
  if(lastUserStore){
    initialState = JSON.parse(lastUserStore!)
  }
  
  export const userReducer = (
    state = initialState,
    action: UserActionTypes
  ): UserState => {
    switch (action.type) {
      case SET_SELF_INFO:
        return { ...state, selfInfo: action.payload };
      case SET_SELF_TOKEN:
        return { ...state, selfToken: action.payload };
      case SET_SELF_INIT_LOADING:
        return { ...state, selfInitLoading: action.payload };
      default:
        return state;
    }
  };