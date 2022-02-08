import { message } from "antd";
import login_bg from "@/assets/images/login_bg.png";
import LoginForm, { FormField, InfoField } from "./components/LoginForm";
import { useState } from "react";
import { Itype } from "../../@types/open_im";
import { useHistoryTravel } from "ahooks";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import md5 from "md5";
import { login as loginApi, register, sendSms, verifyCode } from "../../api/login";
import { im } from "../../utils";
import { getIMUrl, IMURL } from "../../config";
import { useDispatch } from "react-redux";
import { getSelfInfo, getAdminToken, setSelfInfo } from "../../store/actions/user";
import { getCveList } from "../../store/actions/cve";
import { getBlackList, getFriendApplicationList, getFriendList, getGroupApplicationList, getGroupList, getUnReadCount } from "../../store/actions/contacts";
import IMConfigModal from "./components/IMConfigModal";
import TopBar from "../../components/TopBar";
import { InitConfig } from "../../utils/open_im_sdk/types";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState("");
  const [code, setCode] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { value: type, setValue: setType, back } = useHistoryTravel<Itype>("login");

  const finish = (values?: FormField | string | InfoField) => {
    switch (type) {
      case "login":
        if (values) {
          if ((values as FormField).phoneNo == undefined || (values as FormField).password == undefined) return false;
          toggle("success");
          login(values as FormField);
        } else {
          toggle("register");
        }
        break;
      case "register":
        // TODO: send msg
        sendSms((values as FormField)?.phoneNo as string).then((res: any) => {
          if (res.errCode === 0) {
            message.success(t("SendSuccessTip"));
            setNum((values as FormField)?.phoneNo);
            toggle("vericode");
          } else if (res.errCode === 10007) {
            message.info(t("SendDefaultTip"));
            setNum((values as FormField)?.phoneNo);
            toggle("vericode");
          } else {
            message.error(res.data.sendResult);
          }
        });
        break;
      case "vericode":
        // TODO: vericode code
        verifyCode(num, values as string).then((res: any) => {
          if (res.errCode === 0) {
            setCode(values as string);
            toggle("setPwd");
          } else if (res.errCode === 10003) {
            message.error(t("CodeExpired"));
          } else {
            message.error(t("CodeError"));
          }
        });
        break;
      case "setPwd":
        // TODO: set pwd and im login
        register(num, code, md5((values as FormField).password as string)).then((res: any) => {
          if (res.errCode === 0) {
            imLogin(res.data.uid, res.data.token);
            toggle("setInfo");
          } else if (res.errCode === 10005) {
            message.warning(t("AccountRegistered"));
          }
        });
        break;
      case "setInfo":
        // TODO: set & get info
        toggle("success");
        setIMInfo(values as InfoField);
        break;
      default:
        break;
    }
  };

  const setIMInfo = (values: InfoField) => {
    im.setSelfInfo(values)
      .then((res) => {
        dispatch(setSelfInfo(values));
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toggle("setInfo");
        message.error(t("SetInfoFailed"));
      });
  };

  const login = (data: FormField) => {
    loginApi(data.phoneNo, md5(data.password as string))
      .then((res) => {
        imLogin(res.data.uid, res.data.token);
      })
      .catch((err) => {
        loginFailed();
      });
  };

  const imLogin = async (uid: string, token: string) => {
    // navigate('/')
    localStorage.setItem(`${uid}improfile`, token);
    localStorage.setItem(`curimuid`, uid);
    //pc
    localStorage.setItem(`lastimuid`, uid);

    let url = getIMUrl();
    let platformID = 5;
    if (window.electron) {
      url = await window.electron.getLocalWsAddress();
      // if(window.process.platform==="darwin"){
      //   platformID = 4
      // }else if(window.process.platform==="win32"){
      //   platformID = 3
      // }
    }
    const config: InitConfig = {
      uid,
      token,
      url,
      platformID,
    };
    im.login(config)
      .then((res) => {
        dispatch(getSelfInfo(uid));
        dispatch(getCveList());
        dispatch(getFriendList());
        dispatch(getFriendApplicationList());
        dispatch(getGroupList());
        dispatch(getGroupApplicationList());
        dispatch(getUnReadCount());
        dispatch(getBlackList());
        dispatch(getAdminToken());
        if (type === "login") {
          navigate("/", { replace: true });
        }
      })
      .catch((err) => loginFailed(err.errMsg));
  };

  const loginFailed = (msg?: any) => {
    toggle("login");
    if (msg) message.error(msg || t("AccessFailed"));
  };

  const toggle = (mtype: Itype) => {
    setType(mtype);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="login_container">
      <TopBar />
      <div className="login_wapper">
        <div className="center_container">
          <div className="left_container">
            <div onDoubleClick={() => setIsModalVisible(true)} className="title">
              {t("LoginTitle")}
            </div>
            <span className="sub_title">{t("LoginSubTitle")}</span>
            <img src={login_bg} />
          </div>
          <LoginForm loading={loading} back={back} toggle={toggle} type={type} finish={finish} num={num} />
        </div>
        {isModalVisible && <IMConfigModal visible={isModalVisible} close={closeModal} />}
      </div>
      <div className="login_bottom"></div>
    </div>
  );
};

export default Login;
