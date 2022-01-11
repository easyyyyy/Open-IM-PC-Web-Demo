import { Badge, Layout, Modal, Popover, Tooltip } from "antd";

import styles from "./layout.module.less";

import cve from "@/assets/images/cve.png";
import cve_select from "@/assets/images/cve_select.png";
import cons from "@/assets/images/cons.png";
import cons_select from "@/assets/images/cons_select.png";
import { useResolvedPath, useMatch, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { FC, useEffect, useRef, useState } from "react";
import { UserInfo } from "../@types/open_im";
import { RightOutlined, UserOutlined } from "@ant-design/icons";
import { im } from "../utils";
import { MyAvatar } from "../components/MyAvatar";
import UserCard from "../pages/home/components/UserCard";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store";
import { useClickAway } from "ahooks";
import { getAdminUrl, getAxiosUrl, getIMUrl } from "../config";

const { Sider } = Layout;

const tools = [
  {
    tip: "消息",
    icon: cve,
    icon_select: cve_select,
    path: "/",
    idx: 0,
  },
  {
    tip: "通讯录",
    icon: cons,
    icon_select: cons_select,
    path: "/contacts",
    idx: 1,
  },
];

const ToolIcon = ({ tool }: { tool: typeof tools[0] }) => {
  let resolved = useResolvedPath(tool.path);
  let match = useMatch({ path: resolved.pathname, end: true });
  const [applications, setApplications] = useState(0);
  const unReadCount = useSelector(
    (state: RootState) => state.contacts.unReadCount,
    shallowEqual
  );
  const friendApplicationList = useSelector(
    (state: RootState) => state.contacts.friendApplicationList,
    shallowEqual
  );
  const groupApplicationList = useSelector(
    (state: RootState) => state.contacts.groupApplicationList,
    shallowEqual
  );

  useEffect(() => {
    let fan = 0;
    let gan = 0;
    friendApplicationList.map((f) => {
      if (f.flag === 0) fan += 1;
    });
    groupApplicationList.map((g) => {
      if (g.flag === 0) gan += 1;
    });
    setApplications(fan + gan);
  }, [friendApplicationList, groupApplicationList]);

  return (
    <Link to={tool.path}>
      <Tooltip placement="right" title={tool.tip}>
        <div
          className={`${styles.tool_icon} ${
            match ? styles.tool_icon_focus : ""
          }`}
        >
          <Badge
            size="small"
            offset={[0, -8]}
            count={tool.idx === 0 ? unReadCount : applications}
          >
            <img
              width="18"
              height="18"
              src={match ? tool.icon_select : tool.icon}
            />
          </Badge>
        </div>
      </Tooltip>
    </Link>
  );
};

type ToolsBarProps = {
  userInfo: UserInfo;
};

const ToolsBar: FC<ToolsBarProps> = ({ userInfo }) => {
  const [draggableCardVisible, setDraggableCardVisible] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const navigate = useNavigate();
  const popRef = useRef<any>();
  const avaRef = useRef<any>();

  useClickAway(() => {
    if(showPop)setShowPop(false);
  },[popRef,avaRef]);


  const clickMenu = (idx: number) => {
    setShowPop(false);
    switch (idx) {
      case 0:
        setDraggableCardVisible(true);
        break;
      case 1:
        navigate('/profile',{
          state:{
            type:'set'
          }
        })
        break;
      case 2:
        navigate('/profile',{
          state:{
            type:'about'
          }
        })
        break;
      case 3:
        Modal.confirm({
          title:"退出登录",
          content:"您确定要退出登录吗？",
          onOk:logout
        })
        break;
      default:
        break;
    }
  };

  const logout = () => {
    im.logout();
    const IMUrl = getIMUrl();
    const IMAxiosUrl = getAxiosUrl();
    const IMAdminUrl = getAdminUrl();
    const LastUid = localStorage.getItem("lastimuid")
    localStorage.clear();
    localStorage.setItem("IMAxiosUrl",IMAxiosUrl);
    localStorage.setItem("IMUrl",IMUrl);
    localStorage.setItem("IMAdminUrl",IMAdminUrl);
    localStorage.setItem("IMAdminUrl",IMAdminUrl);
    localStorage.setItem("lastimuid",LastUid!);
    navigate("/login");
  };

  const closeDragCard = () => {
    setDraggableCardVisible(false);
  };

  const popMenus = [
    {
      title: "我的信息",
      idx: 0,
    },
    {
      title: "账号设置",
      idx: 1,
    },
    {
      title: "关于我们",
      idx: 2,
    },
    {
      title: "退出登录",
      idx: 3,
    },
  ];

  const popContent = (
    <div ref={popRef} className={styles.tool_self_menu}>
      {popMenus.map((menu) => {
        return (
          <div
            onClick={() => clickMenu(menu.idx)}
            key={menu.idx}
            className={styles.tool_self_item}
          >
            <div>{menu.title}</div>
            <RightOutlined style={{ color: "#b1b2b4", fontSize: "12px" }} />
          </div>
        );
      })}
    </div>
  );

  const popTitle = (
    <div className={styles.tool_self_title}>
      <MyAvatar
        className={styles.tool_self_icon}
        shape="square"
        size={34}
        icon={<UserOutlined />}
        src={userInfo.icon}
      />
      <Tooltip placement="right" title={userInfo.name}>
        <div className={styles.nick_name}>{userInfo.name}</div>
      </Tooltip>
    </div>
  );

  return (
    <Sider width="48" theme="light" className={styles.tool_bar}>
      <div className={styles.tools}>
        <Popover
          trigger="click"
          placement="right"
          content={popContent}
          title={popTitle}
          visible={showPop}
        >
          <div ref={avaRef} onClick={() => setShowPop(true)}>
            <MyAvatar
              className={styles.left_avatar}
              shape="square"
              size={36}
              src={userInfo.icon}
            />
          </div>
        </Popover>
        {tools.map((t, idx) => (
          <ToolIcon tool={t} key={idx} />
        ))}
      </div>
      {draggableCardVisible && (
        <UserCard
          close={closeDragCard}
          info={userInfo}
          type="self"
          draggableCardVisible={draggableCardVisible}
        />
      )}
    </Sider>
  );
};

export default ToolsBar;
