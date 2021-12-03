import { Cve } from "../../@types/open_im";

export type CveState = {
  cves: Cve[];
  curCve: Cve | null;
  cveInitLoading: boolean;
};

export const SET_CVE_LIST = "SET_CVE_LIST";
export const SET_CUR_CVE = "SET_CUR_CVE";
export const SET_CVE_INIT_LOADING = "SET_CVE_INIT_LOADING";

type SetCveList = {
  type: typeof SET_CVE_LIST;
  payload: Cve[];
};

type SetCurCve = {
  type: typeof SET_CUR_CVE;
  payload: Cve;
};

type SetCveInitLoading = {
  type: typeof SET_CVE_INIT_LOADING;
  payload: boolean;
};

export type CveActionTypes = SetCveList | SetCurCve | SetCveInitLoading;
