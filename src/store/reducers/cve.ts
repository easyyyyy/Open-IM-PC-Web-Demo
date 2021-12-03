import {
  CveState,
  CveActionTypes,
  SET_CVE_LIST,
  SET_CUR_CVE,
  SET_CVE_INIT_LOADING,
} from "../types/cve";

let initialState: CveState = {
  cves: [],
  curCve: null,
  cveInitLoading: true,
};

const lastUid = localStorage.getItem('lastimuid') || ''
const lastCveStore = localStorage.getItem(`${lastUid}cveStore`)
if(lastCveStore){
  initialState = JSON.parse(lastCveStore!)
}

export const cveReducer = (
  state = initialState,
  action: CveActionTypes
): CveState => {
  switch (action.type) {
    case SET_CVE_LIST:
      return { ...state, cves: action.payload };
    case SET_CUR_CVE:
      return { ...state, curCve: action.payload };
    case SET_CVE_INIT_LOADING:
      return { ...state, cveInitLoading: action.payload };
    default:
      return state;
  }
};
