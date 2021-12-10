import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Mylayout from "../layout/MyLayout";
import Login from "../pages/login/Login";
import Home from "../pages/home/Cve/home";
import Contacts from "../pages/home/Contact/contacts";
import { useEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { RootState } from "../store";
import { im } from "../utils";
import { IMURL } from "../config";
import { message } from "antd";
import { getCveList, setCveList } from "../store/actions/cve";
import { getFriendApplicationList, getFriendList, getGroupApplicationList, getGroupList, getUnReadCount, setUnReadCount } from "../store/actions/contacts";
import { getSelfInfo } from "../store/actions/user";
import Test from "../pages/Test";
import { CbEvents } from "../utils/src";

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const curuid = localStorage.getItem("curimuid")!;
  const uid = localStorage.getItem("lastimuid")!;
  const token = localStorage.getItem(`${curuid??uid}improfile`)!;

  useEffect(() => {
    
    // if (!curuid && token && uid) {
    if (token && uid) {
      im.getLoginStatus()
        .then((res) => {})
        .catch((err) => {
          console.log(err);
          
          if (token && uid) {
            imLogin();
          }
        });
    }else{
      invalid()
    }
  }, []);

  useEffect(()=>{
    im.on(CbEvents.ONCONVERSATIONCHANGED, (data) => {
      console.log("change in auth");
      dispatch(setCveList(JSON.parse(data.data)));
    });
    im.on(CbEvents.ONTOTALUNREADMESSAGECOUNTCHANGED,(data)=>{
      dispatch(setUnReadCount(Number(data.data)))
    })
    
    im.on(CbEvents.ONFRIENDINFOCHANGED,()=>{
      dispatch(getFriendList())
    })
    im.on(CbEvents.ONFRIENDLISTADDED,()=>{
      dispatch(getFriendList())
    })
    im.on(CbEvents.ONFRIENDLISTDELETED,()=>{
      dispatch(getFriendList())
    })

    im.on(CbEvents.ONFRIENDAPPLICATIONLISTADDED,()=>{
      dispatch(getFriendApplicationList())
    })
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTACCEPT,()=>{
      dispatch(getFriendApplicationList())
    })
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTREJECT,()=>{
      dispatch(getFriendApplicationList())
    })
    im.on(CbEvents.ONFRIENDAPPLICATIONLISTDELETED,()=>{
      dispatch(getFriendApplicationList())
    })

    im.on(CbEvents.ONGROUPCREATED,()=>{
      dispatch(getGroupList())
    })
    im.on(CbEvents.ONGROUPINFOCHANGED,()=>{
      dispatch(getGroupList())
    })
    im.on(CbEvents.ONMEMBERENTER,()=>{
      dispatch(getGroupList())
    })
    im.on(CbEvents.ONMEMBERLEAVE,()=>{
      dispatch(getGroupList())
    })
    im.on(CbEvents.ONMEMBERINVITED,()=>{
      dispatch(getGroupList())
    })
    im.on(CbEvents.ONMEMBERKICKED,()=>{
      dispatch(getGroupList())
    })

    im.on(CbEvents.ONRECEIVEJOINAPPLICATION,()=>{
      dispatch(getGroupApplicationList())
    })
    im.on(CbEvents.ONAPPLICATIONPROCESSED,()=>{
      dispatch(getGroupApplicationList())
    })
  },[])

  const imLogin = () => {
    const config = {
      uid,
      token,
      url: IMURL,
      platformID: 5,
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
        }
      })
      .catch((err) => {
        invalid();
      });
  };

  const invalid = () => {
    message.warning("登录失效，请重新登录！");
    localStorage.removeItem(`${uid}improfile`)
    // localStorage.removeItem('lastimuid')
    navigate("/login");
  };

  return token ? <Mylayout /> : <Navigate to="/login" />;
};

const MyRoute = () => {
  const rootState = useSelector((state: RootState) => state, shallowEqual);

  window.onbeforeunload = function () {
    localStorage.removeItem('curimuid')
    localStorage.setItem('lastimuid',rootState.user.selfInfo.uid!)
    localStorage.setItem(`${rootState.user.selfInfo.uid}userStore`, JSON.stringify(rootState.user));
    localStorage.setItem(`${rootState.user.selfInfo.uid}cveStore`, JSON.stringify(rootState.cve));
    localStorage.setItem(`${rootState.user.selfInfo.uid}consStore`, JSON.stringify(rootState.contacts));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />}>
          <Route index element={<Home />} />
          <Route path="contacts" element={<Contacts />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoute;
