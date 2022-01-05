import {
  LeftOutlined,
} from "@ant-design/icons";
import {
  Drawer,
  message,
  Typography,
} from "antd";
import { FC, useEffect, useState } from "react";
import { Cve, FriendItem, GroupItem, GroupMember } from "../../../@types/open_im";
import { OPENGROUPMODAL, RESETCVE } from "../../../constants/events";
import { events, im, isSingleCve } from "../../../utils";
import SingleDrawer from "./components/SingleDrawer";
import GroupDrawer from "./components/GroupDrawer";
import EditDrawer from "./components/EditDrawer";
import MemberDrawer from "./components/MemberDrawer";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../../store";
import GroupManage from "./components/GroupManage";


type CveRightDrawerProps = {
  curCve: Cve;
  visible: boolean;
  friendInfo?:FriendItem;
  onClose: () => void;
  openCard: () => void;
};

export type DrawerType =
  | "set"
  | "edit_group_info"
  | "member_list"
  | "group_manage";

export enum GroupRole {
  NOMAL = 0,
  OWNER = 1,
  ADMIN = 2,
}

const CveRightDrawer: FC<CveRightDrawerProps> = ({
  curCve,
  visible,
  friendInfo,
  onClose,
  openCard,
}) => {
  const [groupInfo, setGroupInfo] = useState<GroupItem>();
  const [type, setType] = useState<DrawerType>("set");
  const selfID = useSelector((state: RootState) => state.user.selfInfo.uid,shallowEqual);
  const groupMembers = useSelector((state: RootState) => state.contacts.groupMemberList,shallowEqual);
  const [adminList, setAdminList] = useState<GroupMember[]>([]);
  const [role, setRole] = useState<GroupRole>(GroupRole.NOMAL);

  useEffect(() => {
    if (!isSingleCve(curCve)) {
      im.getGroupsInfo([curCve.groupID])
        .then((res) => {
          setGroupInfo(JSON.parse(res.data)[0]);
          getPermission(JSON.parse(res.data)[0]);
        })
        .catch((err) => message.error("获取群聊信息失败！"));
    }
  }, [type, groupMembers]);

  const getPermission = (info: GroupItem) => {
    let adminIds: string[] = [];
    let tmpList = groupMembers.filter((m) => {
      if (m.role === 2) {
        adminIds.push(m.userId);
        return m;
      }
    });
    setAdminList(tmpList);
    if (selfID === info.ownerId) {
      setRole(GroupRole.OWNER);
    } else if (adminIds.includes(selfID!)) {
      setRole(GroupRole.ADMIN);
    } else {
      setRole(GroupRole.NOMAL);
    }
  };

  const changeType = (tp: DrawerType) => {
    setType(tp);
  };

  const delFriend = () => {
    im.deleteFromFriendList(curCve.userID)
      .then((res) => {
        events.emit(RESETCVE);
        message.success("解除好友关系成功！");
      })
      .catch((err) => message.success("解除好友关系失败！"));
  };

  const updatePin = () => {
    const options = {
      conversationID: curCve.conversationID,
      isPinned: curCve.isPinned === 0 ? true : false,
    };
    im.pinConversation(options)
      .then((res) => {
        message.success(curCve.isPinned === 0 ? "置顶成功!" : "取消置顶成功!");
        curCve.isPinned = curCve.isPinned === 0 ? 1 : 0
      })
      .catch((err) => {});
  };

  const quitGroup = () => {
    im.quitGroup(curCve.groupID)
      .then((res) => {
        events.emit(RESETCVE);
        message.success("退出群聊成功！");
      })
      .catch((err) => message.error("退出群聊失败！"));
  };

  const inviteToGroup = () => {
    events.emit(OPENGROUPMODAL, "invite", groupMembers, curCve.groupID);
  };

  const delInGroup = () => {
    events.emit(OPENGROUPMODAL, "remove", groupMembers, curCve.groupID);
  };

  const changeGroupInfo = (val: string, tp: keyof GroupItem) => {
    switch (tp) {
      case "groupName":
        setGroupInfo({ ...groupInfo!, groupName: val });
        break;
      case "faceUrl":
        setGroupInfo({ ...groupInfo!, faceUrl: val });
        break;
      case "introduction":
        setGroupInfo({ ...groupInfo!, introduction: val });
        break;
      default:
        break;
    }
  };

  const updateGroupInfo = () => {
    const options = {
      groupId: groupInfo!.groupID,
      groupName: groupInfo!.groupName,
      introduction: groupInfo!.introduction,
      notification: groupInfo!.notification,
      faceUrl: groupInfo!.notification,
    };
    im.setGroupInfo(options)
      .then((res) => {
        message.success("修改成功！");
        setType("set");
      })
      .catch((err) => message.error("修改失败！"));
  };

  const switchContent = () => {
    if (type === "set") {
      if (isSingleCve(curCve)) {
        return (
          <SingleDrawer
            curCve={curCve}
            info={friendInfo!}
            openCard={openCard}
            updatePin={updatePin}
            delFriend={delFriend}
          />
        );
      } else {
        return (
          <GroupDrawer
            curCve={curCve}
            role={role!}
            groupMembers={groupMembers!}
            updatePin={updatePin}
            changeType={changeType}
            inviteToGroup={inviteToGroup}
            delInGroup={delInGroup}
            quitGroup={quitGroup}
          />
        );
      }
    } else {
      switch (type) {
        case "edit_group_info":
          return (
            <EditDrawer
              groupInfo={groupInfo!}
              changeGroupInfo={changeGroupInfo}
              updateGroupInfo={updateGroupInfo}
            />
          );
        case "member_list":
          return (
            <MemberDrawer
              gid={curCve.groupID}
              groupMembers={groupMembers!}
              role={role!}
              selfID={selfID!}
            />
          );
        case "group_manage":
          return (
            <GroupManage
              gid={curCve.groupID}
              groupMembers={groupMembers}
              adminList={adminList}
            />
          );
        default:
          break;
      }
    }
  };

  const backTitle = (tp: DrawerType, title: string) => (
    <div>
      <LeftOutlined onClick={() => setType(tp)} />
      <span style={{ marginLeft: "12px" }}>{title}</span>
    </div>
  );

  const switchTitle = () => {
    switch (type) {
      case "set":
        return <div>设置</div>;
      case "edit_group_info":
        return backTitle("set", "编辑群信息");
      case "member_list":
        return backTitle("set", "群成员");
      case "group_manage":
        return backTitle("set", "群管理");
      default:
        break;
    }
  };

  return (
    <Drawer
      className="right_set_drawer"
      width={360}
      // mask={false}
      maskClosable
      title={switchTitle()}
      placement="right"
      onClose={() => {
        setType("set");
        onClose();
      }}
      closable={type==="set"}
      visible={visible}
      getContainer={document.getElementById("chat_main")!}
    >
      {switchContent()}
    </Drawer>
  );
};

export default CveRightDrawer;
