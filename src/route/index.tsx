import { BrowserRouter, HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Mylayout from "../layout/MyLayout";
import Login from "../pages/login/Login";
import Home from "../pages/home/Cve/home";
import Contacts from "../pages/home/Contact/contacts";
import Profile from "../pages/home/Profile/Profile";
import { FC, ReactNode, useEffect, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { RootState } from "../store";
import { im } from "../utils";
import { IMURL } from "../config";
import { message, Modal, Spin } from "antd";
import { getCveList, setCveList } from "../store/actions/cve";
import { getBlackList, getFriendApplicationList, getFriendList, getGroupApplicationList, getGroupList, getUnReadCount, setUnReadCount } from "../store/actions/contacts";
import { getSelfInfo, getAdminToken } from "../store/actions/user";
import Test from "../pages/Test";
import { CbEvents } from "../utils/src";
import { Cve } from "../@types/open_im";

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const curuid = localStorage.getItem("curimuid")!;
  const uid = localStorage.getItem("lastimuid")!;
  const token = localStorage.getItem(`${curuid ?? uid}improfile`)!;
  const [golbalLoading, setGolbalLoading] = useState(false);
  const cves = useSelector((state: RootState) => state.cve.cves, shallowEqual);

  useEffect(() => {
    // if (!curuid && token && uid) {
    if (token && uid) {
      setGolbalLoading(true);
      im.getLoginStatus()
        .then((res) => setGolbalLoading(false))
        .catch((err) => {
          if (token && uid) {
            imLogin();
          }
        });
    } else {
      invalid();
    }
  }, []);

  useEffect(() => {
    im.on(CbEvents.ONCONVERSATIONCHANGED, (data) => {
      let tmpCves = cves;
      const changes: Cve[] = JSON.parse(data.data);

      const chids = changes.map((ch) => ch.conversationID);
      tmpCves = tmpCves.filter((tc) => !chids.includes(tc.conversationID));
      tmpCves = [...changes, ...tmpCves];
      cveSort(tmpCves);
      dispatch(setCveList(tmpCves));
    });

    im.on(CbEvents.ONNEWCONVERSATION, (data) => {
      let tmpCves = cves;
      const news: Cve[] = JSON.parse(data.data);
      tmpCves = [...news, ...tmpCves];
      cveSort(tmpCves);

      dispatch(setCveList(tmpCves));
    });
    return () => {
      im.off(CbEvents.ONCONVERSATIONCHANGED, () => {});
      im.off(CbEvents.ONNEWCONVERSATION, () => {});
    };
  }, [cves]);

  useEffect(() => {
    im.on(CbEvents.ONTOTALUNREADMESSAGECOUNTCHANGED, (data) => {
      dispatch(setUnReadCount(Number(data.data)));
    });

    im.on(CbEvents.ONFRIENDINFOCHANGED, () => {
      dispatch(getFriendList());
    });
    im.on(CbEvents.ONFRIENDLISTADDED, () => {
      dispatch(getFriendList());
    });
    im.on(CbEvents.ONFRIENDLISTDELETED, () => {
      dispatch(getFriendList());
    });

    im.on(CbEvents.ONBLACKLISTADD, () => {
      dispatch(getBlackList());
    });

    im.on(CbEvents.ONBLACKLISTDELETED, () => {
      dispatch(getBlackList());
    });

    im.on(CbEvents.ONFRIENDAPPLICATIONLISTADDED, () => {
      dispatch(getFriendApplicationList());
    });
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTACCEPT, () => {
      dispatch(getFriendApplicationList());
    });
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTREJECT, () => {
      dispatch(getFriendApplicationList());
    });
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTDELETED, () => {
      dispatch(getFriendApplicationList());
    });

    im.on(CbEvents.ONGROUPCREATED, () => {
      dispatch(getGroupList());
    });
    im.on(CbEvents.ONGROUPINFOCHANGED, () => {
      dispatch(getGroupList());
    });
    im.on(CbEvents.ONMEMBERENTER, () => {
      dispatch(getGroupList());
    });
    im.on(CbEvents.ONMEMBERLEAVE, () => {
      dispatch(getGroupList());
    });
    im.on(CbEvents.ONMEMBERINVITED, () => {
      dispatch(getGroupList());
    });
    im.on(CbEvents.ONMEMBERKICKED, () => {
      dispatch(getGroupList());
    });

    im.on(CbEvents.ONRECEIVEJOINAPPLICATION, () => {
      dispatch(getGroupApplicationList());
    });
    im.on(CbEvents.ONAPPLICATIONPROCESSED, () => {
      dispatch(getGroupApplicationList());
    });
  }, []);
  //@ts-ignore

  const imLogin = async () => {
    let url = IMURL;
    let platformID = 5;
    if (window.electron) {
      const ip = await window.electron.getIP();
      url = `ws://${ip}:7788`;
      // if(window.process.platform==="darwin"){
      //   platformID = 4
      // }else if(window.process.platform==="win32"){
      //   platformID = 3
      // }
    }
    const config = {
      uid,
      token,
      url,
      platformID,
    };
    im.login(config)
      .then((res) => {
        if (res.errCode !== 0) {
          invalid();
        } else {
          dispatch(getSelfInfo(uid));
          dispatch(getCveList());
          dispatch(getFriendList());
          dispatch(getFriendApplicationList());
          dispatch(getGroupList());
          dispatch(getGroupApplicationList());
          dispatch(getUnReadCount());
          dispatch(getBlackList());
          dispatch(getAdminToken());
          setGolbalLoading(false);
        }
      })
      .catch((err) => {
        invalid();
      });
  };

  const invalid = () => {
    setGolbalLoading(false);
    message.warning("登录失效，请重新登录！");
    localStorage.removeItem(`${uid}improfile`);
    // localStorage.removeItem('lastimuid')
    navigate("/login");
  };

  const deWeightThree = (cves: Cve[]) => {
    let map = new Map();
    for (let item of cves) {
      if (!map.has(item.conversationID)) {
        map.set(item.conversationID, item);
      }
    }
    return [...map.values()];
  };

  const cveSort = (cveList: Cve[]) => {
    cveList.sort((a, b) => {
      if ((a.isPinned == 1 && b.isPinned == 1) || (a.isPinned != 1 && b.isPinned != 1)) {
        const aCompare = a.draftTimestamp! > a.latestMsgSendTime! ? a.draftTimestamp! : a.latestMsgSendTime!;
        const bCompare = b.draftTimestamp! > b.latestMsgSendTime! ? b.draftTimestamp! : b.latestMsgSendTime!;
        if (aCompare > bCompare) {
          return -1;
        } else if (aCompare < bCompare) {
          return 1;
        } else {
          return 0;
        }
      } else if (a.isPinned == 1 && b.isPinned != 1) {
        return -1;
      } else {
        return 1;
      }
    });
  };

  return (
    <>
      {token ? <Mylayout /> : <Navigate to="/login" />}
      <Modal
        footer={null}
        visible={golbalLoading}
        closable={false}
        centered
        className="global_loading"
        maskStyle={{
          backgroundColor: "transparent",
        }}
        bodyStyle={{
          padding: 0,
          textAlign: "center",
        }}
      >
        <Spin tip="login..." size="large" />
      </Modal>
    </>
  );
};

const RouterWrapper = ({ children }: { children: ReactNode }) => {
  return window.electron ? <HashRouter>{children}</HashRouter> : <BrowserRouter>{children}</BrowserRouter>;
};

const MyRoute = () => {
  const rootState = useSelector((state: RootState) => state, shallowEqual);

  window.onbeforeunload = function () {
    localStorage.removeItem("curimuid");
    localStorage.setItem("lastimuid", rootState.user.selfInfo.uid!);
    localStorage.setItem(`${rootState.user.selfInfo.uid}userStore`, JSON.stringify(rootState.user));
    localStorage.setItem(`${rootState.user.selfInfo.uid}cveStore`, JSON.stringify(rootState.cve));
    localStorage.setItem(`${rootState.user.selfInfo.uid}consStore`, JSON.stringify(rootState.contacts));
  };

  return (
    <RouterWrapper>
      <Routes>
        <Route path="/" element={<Auth />}>
          <Route index element={<Home />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />}></Route>
      </Routes>
    </RouterWrapper>
  );
};

export default MyRoute;
