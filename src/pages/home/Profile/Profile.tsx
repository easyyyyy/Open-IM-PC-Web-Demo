import { shallowEqual } from "@babel/types";
import { Button, Empty, Layout, message } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { MyAvatar } from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { im } from "../../../utils";

const { Header, Sider, Content } = Layout;

const aboutMenus = [
  {
    title: "检查新版本",
    idx: 0,
  },
  {
    title: "新功能介绍",
    idx: 1,
  },
  {
    title: "服务协议",
    idx: 2,
  },
  {
    title: "OpenIM隐私政策",
    idx: 3,
  },
  {
    title: "版权信息",
    idx: 4,
  },
];

const setMenus = [
  {
    title: "个人设置",
    idx: 0,
  },
  {
    title: "通讯录黑名单",
    idx: 1,
  },
];

const Blacklist = () => {
  const blackList = useSelector((state: RootState) => state.contacts.blackList, shallowEqual);
  const rmBl = (id: string) => {
    im.deleteFromBlackList(id).then((res) => message.success("移除成功！"));
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
              移除
            </Button>
          </div>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      )}
    </div>
  );
};

const Profile = () => {
  const type = useLocation().state.type ?? "about";
  const [curMenu, setCurMenu] = useState("");

  const clickMenu = (idx: number) => {
    switch (idx) {
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
  return (
    <Layout className="profile">
      <Header className="profile_header">{type === "about" ? "关于我们" : "账号设置"}</Header>
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
        <Content className="profile_content">{curMenu === "bl" ? <Blacklist /> : "..."}</Content>
      </Layout>
    </Layout>
  );
};

export default Profile;
