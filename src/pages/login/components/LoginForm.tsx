import {
  Input,
  Button,
  Checkbox,
  Form,
  Select,
  Avatar,
  Spin,
  Upload,
} from "antd";
import { LeftOutlined, UserOutlined } from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import styles from "./login_form.module.less";
import { Itype } from "../../../@types/open_im";
//@ts-ignore
import Codebox from "@/components/CodeBox";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { useInterval, useToggle } from "ahooks";
import { findEmptyValue } from "../../../utils/objUtl";
import { cosUpload } from "../../../utils";
import { MyAvatar } from "../../../components/MyAvatar";

import ic_avatar_01 from "@/assets/images/ic_avatar_01.png";
import ic_avatar_02 from "@/assets/images/ic_avatar_02.png";
import ic_avatar_03 from "@/assets/images/ic_avatar_03.png";
import ic_avatar_04 from "@/assets/images/ic_avatar_04.png";
import ic_avatar_05 from "@/assets/images/ic_avatar_05.png";
import ic_avatar_06 from "@/assets/images/ic_avatar_06.png";

const localIconList = [
  ic_avatar_01,
  ic_avatar_02,
  ic_avatar_03,
  ic_avatar_04,
  ic_avatar_05,
  ic_avatar_06,
];

const { Option } = Select;

const phoneRules = [
  {
    message: "请输入正确格式手机号",
    pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
    validateTrigger: "onFinish",
  },
];

const pwdRules = [
  {
    message: "请输入正确6-20位字符密码",
    min: 6,
    max: 20,
    validateTrigger: "onFinish",
  },
];

const rePwdRules = [
  {
    message: "请输入正确6-20位字符密码",
    min: 6,
    max: 20,
    validateTrigger: "onFinish",
  },
  (ctx: any) => ({
    validator(_: any, value: string) {
      if (!value || ctx.getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("两次输入的密码不一致!"));
    },
  }),
];

export type FormField = {
  areaCode: string;
  phoneNo: string;
  password?: string;
};

export type InfoField = {
  name: string;
  icon: string;
};

type IProps = {
  finish: (values?: FormField | string | InfoField) => void;
  type: Itype | undefined;
  toggle: (mtype: Itype) => void;
  back: () => void;
  loading: boolean;
  num: string;
};

const CodeBox = ({ finish, type, loading, num }: IProps) => {
  const [code, setCode] = useState("");
  const [time, setTime] = useState(60);
  const [interval, setInterval] = useState<number | null>(1000);

  useInterval(
    () => {
      setTime(time! - 1);
      if (time === 1) setInterval(null);
    },
    interval as number,
    { immediate: true }
  );

  return (
    <>
      <div className={styles.form_title}>
        {type == "vericode" ? "验证手机号" : "欢迎使用OpenIM"}
      </div>
      <div className={styles.sub_tip}>
        请输入发送至<span>+{`86 ${num}`}</span>的6位验证码，有效期十分钟。
      </div>
      <Codebox
        length={6}
        type="text"
        validator={(input: string) => {
          return /\d/.test(input);
        }}
        onChange={(v: string[]) => {
          const vs = v.toString().replace(/,/g, "");
          setCode(vs);
          if (vs.length === 6) finish(vs);
        }}
      />
      <div className={styles.sub_tip}>
        <span>{time}s </span>后{" "}
        <span
          onClick={() => {
            setTime(60);
            setInterval(1000);
          }}
          style={{ cursor: time === 0 ? "pointer" : "" }}
        >
          重新获取
        </span>{" "}
        验证码
      </div>
      <Button
        loading={loading}
        style={{ marginTop: "72px" }}
        type="primary"
        onClick={() => finish(code)}
      >
        下一步
      </Button>
    </>
  );
};

const LoginForm: FC<IProps> = (props) => {
  const [form] = Form.useForm<FormField>();
  const [btmSts, { set: setBtm }] = useToggle();
  const [backSts, { set: setBack }] = useToggle();
  const [sInfo, setSInfo] = useState<InfoField>({
    name: "",
    icon: `ic_avatar_0${parseInt(6 * Math.random() + "")}`,
  });

  useEffect(() => {
    if (props.type === "login" || props.type === "register") {
      setBtm(true);
    } else {
      setBtm(false);
    }
    if (props.type === "register" || props.type === "vericode") {
      setBack(true);
    } else {
      setBack(false);
    }
  }, [props.type]);

  const inputForm = (
    <>
      <div className={styles.form_title}>欢迎使用OpenIM</div>
      <Form
        form={form}
        onFinish={props.finish}
        layout="vertical"
        initialValues={{
          areaCode: "86",
        }}
      >
        <Form.Item className={styles.no_mb} label="手机号码">
          <Input.Group compact>
            <Form.Item name="areaCode">
              <Select bordered={false}>
                <Option value={"86"}>+86</Option>
                <Option value={"89"}>+89</Option>
              </Select>
            </Form.Item>
            <Form.Item name="phoneNo" rules={phoneRules}>
              <Input bordered={false} placeholder="请输入手机号码" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        {props.type === "login" ? (
          <Form.Item name="password" label="密码" rules={pwdRules}>
            <Input.Password
              style={{ width: "100%" }}
              bordered={false}
              placeholder="请输入密码"
              allowClear
            />
          </Form.Item>
        ) : null}
        <Form.Item>
          <Button loading={props.loading} htmlType="submit" type="primary">
            {props.type === "login" ? "登录" : "注册"}
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  const help = (
    <span style={{ fontSize: "12px", color: "#428be5" }}>需6~20位字符</span>
  );

  const setPwd = (
    <>
      <div className={styles.form_title}>
        请设置账户密码
        <div className={styles.sub_title}>登录密码用于登录OpenIM账号</div>
      </div>
      <Form onFinish={props.finish} layout="vertical">
        <Form.Item name="password" label="密码" rules={pwdRules} extra={help}>
          <Input.Password
            style={{ width: "100%" }}
            bordered={false}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item
          name="rePassword"
          label="确认密码"
          rules={rePwdRules}
          dependencies={["password"]}
        >
          <Input.Password
            style={{ width: "100%" }}
            bordered={false}
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item style={{ margin: "48px 0 0 0" }}>
          <Button loading={props.loading} htmlType="submit" type="primary">
            下一步
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  const cusromUpload = (data: UploadRequestOption) => {
    cosUpload(data).then((res) => setSInfo({ ...sInfo, icon: res.url }));
  };

  const setInfo = (
    <>
      <div className={styles.form_title}>
        欢迎使用OpenIM
        <div className={styles.sub_title}>请完善个人信息</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <Upload
          name="avatar"
          action={""}
          customRequest={(data) => cusromUpload(data)}
          showUploadList={false}
        >
          <MyAvatar size={72} src={sInfo.icon} icon={<UserOutlined />} />
          <div
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "8px",
              display: sInfo.icon === "" ? "block" : "none",
            }}
          >
            点击上传头像
          </div>
        </Upload>
      </div>
      <div className={styles.name_input}>
        <div className={styles.name_lable}>你的姓名</div>
        <Input
          allowClear={true}
          bordered={false}
          placeholder="请填写真实姓名"
          onChange={(v) =>
            setSInfo({
              ...sInfo,
              name: v.target.value,
            })
          }
        />
      </div>
      <Button
        loading={props.loading}
        style={{ marginTop: "48px" }}
        type="primary"
        onClick={() => {
          if (findEmptyValue(sInfo)) {
            props.finish(sInfo);
          }
        }}
      >
        进入OpenIM
      </Button>
    </>
  );

  const loading = (
    <div className={styles.loading_spin}>
      <Spin size="large" />
    </div>
  );

  const backIcon = (
    <div
      style={{
        position: "absolute",
        top: "14px",
        fontSize: "12px",
        color: "#777",
        cursor: "pointer",
      }}
      onClick={() => props.back()}
    >
      <LeftOutlined />
      返回
    </div>
  );

  const bottomAccess = (
    <div>
      <Checkbox defaultChecked={true} onChange={() => {}}>
        我已阅读并同意<span className={styles.primary}>用户协议</span>和
        <span className={styles.primary}>隐私协议</span>
      </Checkbox>
      {props.type === "login" ? (
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          还没有账号？{" "}
          <span
            onClick={() => props.finish()}
            style={{ fontSize: "13px", color: "#428BE5", cursor: "pointer" }}
          >
            立即注册
          </span>
        </div>
      ) : null}
    </div>
  );

  const getForm = () => {
    switch (props.type) {
      case "login":
      case "register":
        return inputForm;
      case "vericode":
        return <CodeBox {...props} />;
      case "setPwd":
        return setPwd;
      case "setInfo":
        return setInfo;
      default:
        return loading;
    }
  };

  return (
    <div className={styles.right_container}>
      {backSts && backIcon}
      {getForm()}
      {btmSts && bottomAccess}
    </div>
  );
};

export default LoginForm;
