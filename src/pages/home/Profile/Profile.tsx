import { shallowEqual } from "@babel/types";
import { Button, Empty, Layout, message, Radio, RadioChangeEvent } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { MyAvatar } from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { im } from "../../../utils";

const { Header, Sider, Content } = Layout;

type LanguageType = "zh"|"en"

const PersonalSetting = () => {
  const { i18n, t } = useTranslation();

  const onChange = (e: RadioChangeEvent) => {
    i18n.changeLanguage(e.target.value)
    localStorage.setItem("IMLanguage",e.target.value)
  };

  return (
    <div className="personal_setting">
      <div className="personal_setting_item">
      <div className="title">{t("SelectLanguage")}</div>
      <Radio.Group onChange={onChange} value={i18n.language}>
        <Radio value="zh">简体中文</Radio>
        <Radio value="en">English</Radio>
      </Radio.Group>
      </div>
    </div>
  );
};

const Blacklist = () => {
  const { t } = useTranslation();
  const blackList = useSelector((state: RootState) => state.contacts.blackList, shallowEqual);
  const rmBl = (id: string) => {
    im.deleteFromBlackList(id).then((res) => message.success(t("RemoveMembersSuc")));
  };

  return (
    <div className="profile_content_bl">
      {blackList.length > 0 ? (
        blackList.map((bl) => (
          <div key={bl.uid} className="profile_content_bl_item">
            <div className="item_left">
              <MyAvatar src={bl.icon} size={36} />
              <div className="nick">{bl.name}</div>
            </div>
            <Button onClick={() => rmBl(bl.uid!)} type="link">
              {t("Remove")}
            </Button>
          </div>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoData")} />
      )}
    </div>
  );
};

const Profile = () => {
  const type = (useLocation().state as any).type ?? "about";
  const [curMenu, setCurMenu] = useState("");
  const { t } = useTranslation();

  const aboutMenus = [
    {
      title: t("CheckVersion"),
      idx: 0,
    },
    {
      title: t("NewFunctions"),
      idx: 1,
    },
    {
      title: t("ServceAggrement"),
      idx: 2,
    },
    {
      title: `OpenIM${t("PrivacyAgreement")}`,
      idx: 3,
    },
    {
      title: t("Copyright"),
      idx: 4,
    },
  ];

  const setMenus = [
    {
      title: t("PersonalSettings"),
      idx: 0,
    },
    {
      title: t("Blacklist"),
      idx: 1,
    },
  ];

  const clickMenu = (idx: number) => {
    switch (idx) {
      case 0:
        if (type === "set") {
          setCurMenu("ps");
        }
        break;
      case 1:
        if (type === "set") {
          setCurMenu("bl");
        }
        break;
      default:
        setCurMenu("");
        break;
    }
  };

  const switchContent = () => {
    switch (curMenu) {
      case "bl":
        return <Blacklist />
      case "ps":
        return <PersonalSetting/>
      default:
        return <div>...</div>
    }
  }
  return (
    <Layout className="profile">
      <Header className="profile_header">{type === "about" ? t("AboutUs") : t("AccountSettings")}</Header>
      <Layout>
        <Sider width="350" className="profile_sider" theme="light">
          <div className="profile_sider_menu">
            {(type === "about" ? aboutMenus : setMenus).map((mu) => (
              <div key={mu.idx} onClick={() => clickMenu(mu.idx)} className="profile_sider_menu_item">
                {mu.title}
              </div>
            ))}
          </div>
        </Sider>
        <Content className="profile_content">{switchContent()}</Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
