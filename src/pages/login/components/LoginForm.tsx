import { Input, Button, Checkbox, Form, Select, Spin, Upload } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { useToggle } from "ahooks";
import { findEmptyValue } from "../../../utils/common";
import { cosUpload } from "../../../utils";
import { MyAvatar } from "../../../components/MyAvatar";
import CodeBox from "./CodeBox"

import { useTranslation } from "react-i18next";
import { Itype } from "../../../@types/open_im";

const { Option } = Select;

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

const LoginForm: FC<IProps> = (props) => {
  const { t } = useTranslation();
  const [btmSts, { set: setBtm }] = useToggle();
  const [backSts, { set: setBack }] = useToggle();
  const [sInfo, setSInfo] = useState<InfoField>({
    name: "",
    icon: `ic_avatar_0${Math.ceil(Math.random()*6)}`,
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

  const phoneRules = [
    {
      message: t("PhoneRule"),
      pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
      validateTrigger: "onFinish",
    },
  ];
  
  const pwdRules = [
    {
      message: t("PassWordRule"),
      min: 6,
      max: 20,
      validateTrigger: "onFinish",
    },
  ];
  
  const rePwdRules = [
    {
      message: t("PassWordRule"),
      min: 6,
      max: 20,
      validateTrigger: "onFinish",
    },
    (ctx: any) => ({
      validator(_: any, value: string) {
        if (!value || ctx.getFieldValue("password") === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(t("PassWordRepeat")));
      },
    }),
  ];

  const initialValues = {
    areaCode: "86",
    phoneNo: props.type === "login" ? localStorage.getItem("lastimuid")??"" : "",
  };

  const inputForm = (
    <>
      <div className="form_title">{t("LoginFormTitle")}</div>
      <Form onFinish={props.finish} layout="vertical" initialValues={initialValues}>
        <Form.Item className="no_mb" label={t("PhoneNumber")}>
          <Input.Group compact>
            <Form.Item name="areaCode">
              <Select bordered={false}>
                <Option value={"86"}>+86</Option>
                <Option value={"89"}>+89</Option>
              </Select>
            </Form.Item>
            <Form.Item name="phoneNo" rules={phoneRules}>
              <Input bordered={false} placeholder={t("PhoneNumberTip")} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        {props.type === "login" ? (
          <Form.Item name="password" label={t("Password")} rules={pwdRules}>
            <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PhoneNumberTip")} allowClear />
          </Form.Item>
        ) : null}
        <Form.Item>
          <Button loading={props.loading} htmlType="submit" type="primary">
            {props.type === "login" ? t("Login") : t("Register")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  const help = <span style={{ fontSize: "12px", color: "#428be5" }}>{t("PasswolrdNotice")}</span>;

  const setPwd = (
    <>
      <div className="form_title">
        {t("SetAccountTitle")}
        <div className="sub_title">{t("SetAccountSubTitle")}</div>
      </div>
      <Form onFinish={props.finish} layout="vertical">
        <Form.Item name="password" label={t("Password")} rules={pwdRules} extra={help}>
          <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PasswordTip")} />
        </Form.Item>

        <Form.Item name="rePassword" label={t("ComfirmPassword")} rules={rePwdRules} dependencies={["password"]}>
          <Input.Password style={{ width: "100%" }} bordered={false} placeholder={t("PasswordTip")} />
        </Form.Item>

        <Form.Item style={{ margin: "48px 0 0 0" }}>
          <Button loading={props.loading} htmlType="submit" type="primary">
            {t("NextStep")}
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
      <div className="form_title">
        {t("LoginFormTitle")}
        <div className="sub_title">{t("SetInfoSubTitle")}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <Upload accept="image/*" name="avatar" action={""} customRequest={(data) => cusromUpload(data)} showUploadList={false}>
          <MyAvatar size={72} src={sInfo.icon} />
          <div
            style={{
              fontSize: "12px",
              color: "#777",
              marginTop: "8px",
              display: sInfo.icon === "" ? "block" : "none",
            }}
          >
            {t("SetAvatar")}
          </div>
        </Upload>
      </div>
      <div className="name_input">
        <div className="name_lable">{t("SetName")}</div>
        <Input
          allowClear={true}
          bordered={false}
          placeholder={t("SetNameNotice")}
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
        {t("RegistrationCompleted")}
      </Button>
    </>
  );

  const loading = (
    <div className="loading_spin">
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
      {t("Back")}
    </div>
  );

  const bottomAccess = (
    <div>
      <Checkbox defaultChecked={true} onChange={() => {}}>
        {t("LoginNotice")}
        <span className="primary">{` ${t("UserAgreement")} `}</span>
        {t("And")}
        <span className="primary">{` ${t("PrivacyAgreement")} `}</span>
      </Checkbox>
      {props.type === "login" ? (
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          {`${t("NoAccount")} `}
          <span onClick={() => props.finish()} style={{ fontSize: "13px", color: "#428BE5", cursor: "pointer" }}>
            {t("RegisterNow")}
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
    <div className="login_form">
      {backSts && backIcon}
      {getForm()}
      {btmSts && bottomAccess}
    </div>
  );
};

export default LoginForm;
