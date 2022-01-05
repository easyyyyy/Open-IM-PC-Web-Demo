import { message } from "antd";
import styles from "./login.module.less";
import login_bg from "@/assets/images/login_bg.png";
import LoginForm, { FormField, InfoField } from "./components/LoginForm";
import { useEffect, useState } from "react";
import { Itype } from "../../@types/open_im";
import { useHistoryTravel } from "ahooks";
import { useNavigate } from "react-router";
import md5 from "md5";
import {
  login as loginApi,
  register,
  sendSms,
  verifyCode,
} from "../../api/login";
import { im } from "../../utils";
import { InitConfig } from "open-im-sdk/im";
import { IMURL } from "../../config";
import { useDispatch } from "react-redux";
import { getSelfInfo, getAdminToken, setSelfInfo } from "../../store/actions/user";
import { getCveList } from "../../store/actions/cve";
import {
  getBlackList,
  getFriendApplicationList,
  getFriendList,
  getGroupApplicationList,
  getGroupList,
  getUnReadCount,
} from "../../store/actions/contacts";


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState("");
  const [code, setCode] = useState("");
  const {
    value: type,
    setValue: setType,
    back,
  } = useHistoryTravel<Itype>("login");


  const finish = (values?: FormField | string | InfoField) => {
    switch (type) {
      case "login":
        if (values) {
          if (
            (values as FormField).phoneNo == undefined ||
            (values as FormField).password == undefined
          )
            return false;
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
            message.success("验证码已发送！");
            setNum((values as FormField)?.phoneNo);
            toggle("vericode");
          } else if (res.errCode === 10007) {
            message.info("后台未正确配置短信服务，请使用超级验证码注册！");
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
            message.error("验证码过期！");
          } else {
            message.error("验证错误！");
          }
        });
        break;
      case "setPwd":
        // TODO: set pwd and im login
        register(num, code, md5((values as FormField).password as string)).then(
          (res: any) => {
            if (res.errCode === 0) {
              imLogin(res.data.uid, res.data.token);
              toggle("setInfo");
            } else if (res.errCode === 10005) {
              message.warning("该账号已被注册！");
            }
          }
        );
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
        message.error("设置个人信息失败，请稍后再试！");
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

    let url = IMURL;
    let platformID = 5;
    if(window.electron){
      const ip = await window.electron.getIP()
      url = `ws://${ip}:7788`
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
      platformID
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
        dispatch(getBlackList())
        dispatch(getAdminToken())
        if (type === "login") {
          navigate("/", { replace: true });
        }
      })
      .catch((err) => loginFailed(err.errMsg));
  };

  const loginFailed = (msg?: any) => {
    toggle("login");
    if (msg) message.error(msg || "操作失败，请稍后再试！");
  };

  const toggle = (mtype: Itype) => {
    setType(mtype);
  };

  return (
    <div className={styles.wapper}>
      <div className={styles.center_container}>
        <div className={styles.left_container}>
          <div className={styles.title}>在线化办公</div>
          <span className={styles.sub_title}>多人协作，打造高效办公方式</span>
          <img src={login_bg} />
        </div>
        <LoginForm
          loading={loading}
          back={back}
          toggle={toggle}
          type={type}
          finish={finish}
          num={num}
        />
      </div>
    </div>
  );
};

export default Login;
