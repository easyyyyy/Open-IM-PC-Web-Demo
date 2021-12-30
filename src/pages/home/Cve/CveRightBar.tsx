import { Layout, message, Tooltip } from "antd";
import right_file from "@/assets/images/right_file.png";
import right_file_se from "@/assets/images/right_file_se.png";
import right_search from "@/assets/images/right_search.png";
import right_search_se from "@/assets/images/right_search_se.png";
import right_setting from "@/assets/images/right_setting.png";
import right_setting_se from "@/assets/images/right_setting_se.png";
import right_notice from "@/assets/images/right_notice.png";
import right_notice_se from "@/assets/images/right_notice_se.png";
import { FC, useEffect, useState } from "react";
import { Cve, FriendItem, GroupItem, GroupMember } from "../../../@types/open_im";
import { events, im, isSingleCve } from "../../../utils";
import { OPENSINGLEMODAL, TOASSIGNCVE } from "../../../constants/events";
import CveRightDrawer from "./CveRightDrawer";

const { Sider } = Layout;

type CveRightBarProps = {
  curCve: Cve;
  groupMembers: GroupMember[];
  friendInfo?: FriendItem;
};

const CveRightBar: FC<CveRightBarProps> = ({ curCve, groupMembers, friendInfo }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [curTool, setCurTool] = useState(-1);
  const [groupInfo, setGroupInfo] = useState<GroupItem>();
  const [type, setType] = useState<"set" | "edit_group_info">("set");

  useEffect(() => {
    if (!isSingleCve(curCve)) {
      im.getGroupsInfo([curCve.groupID])
        .then((res) => {
          setGroupInfo(JSON.parse(res.data)[0]);
        })
        .catch((err) => message.error("获取群聊信息失败！"));
    }
  }, []);

  useEffect(() => {
    events.on(TOASSIGNCVE, assignHandler);
    return () => {
      events.off(TOASSIGNCVE, assignHandler);
    };
  }, []);

  const assignHandler = () => {
    if (visibleDrawer) {
      setCurTool(-1);
      setVisibleDrawer(false);
    }
  };

  const openCard = () => {
    // setDraggableCardVisible(true);
    events.emit(OPENSINGLEMODAL, friendInfo);
  };

  const onClose = () => {
    setVisibleDrawer(false);
    setCurTool(-1);
  };

  const clickItem = (idx: number) => {
    setCurTool(idx);
    switch (idx) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        setVisibleDrawer(true);
        break;
      default:
        break;
    }
  };

  const toolIcon = (tool: typeof tools[0]) => {
    if (tool.tip === "群公告") return null;
    return (
      <Tooltip key={tool.tip} placement="right" title={tool.tip}>
        <div className="right_bar_col_icon" onClick={() => tool.method(tool.idx)}>
          <img
            // width="20px"
            // height="20px"
            src={curTool === tool.idx ? tool.icon_se : tool.icon}
          />
        </div>
      </Tooltip>
    );
  };

  const tools = [
    {
      tip: "群公告",
      icon: right_notice,
      icon_se: right_notice_se,
      method: clickItem,
      idx: 0,
    },
    {
      tip: "查找",
      icon: right_search,
      icon_se: right_search_se,
      method: clickItem,
      idx: 1,
    },
    {
      tip: "文件",
      icon: right_file,
      icon_se: right_file_se,
      method: clickItem,
      idx: 2,
    },
    {
      tip: "设置",
      icon: right_setting,
      icon_se: right_setting_se,
      method: clickItem,
      idx: 3,
    },
  ];

  return (
    <Sider width="42" theme="light" className="right_bar">
      <div className="right_bar_col">{tools.map((t) => toolIcon(t))}</div>
      {visibleDrawer && <CveRightDrawer visible={visibleDrawer} curCve={curCve} groupMembers={groupMembers} friendInfo={friendInfo} onClose={onClose} openCard={openCard} />}
    </Sider>
  );
};

export default CveRightBar;
