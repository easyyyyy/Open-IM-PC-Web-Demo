import {
  RightOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Input, Switch, Button, Typography } from "antd";
import { FC } from "react";
import { Cve, GroupMember } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { DrawerType, GroupRole } from "../CveRightDrawer";

const { Paragraph } = Typography;

type GroupDrawerProps = {
  curCve: Cve;
  role: GroupRole;
  groupMembers: GroupMember[];
  changeType: (tp: DrawerType) => void;
  inviteToGroup: () => void;
  delInGroup: () => void;
  updatePin: () => void;
  quitGroup: () => void;
};

const GroupDrawer: FC<GroupDrawerProps> = ({
  curCve,
  role,
  groupMembers,
  changeType,
  inviteToGroup,
  delInGroup,
  updatePin,
  quitGroup,
}) => {
  const toManage = () => {
    if (role === GroupRole.OWNER) {
      changeType("group_manage");
    }
  };

  return (
    <div className="group_drawer">
      <div className="group_drawer_item">
        <div className="group_drawer_item_left">
          <MyAvatar size={36} shape="square" src={curCve.faceUrl} />
          <div className="group_drawer_item_info">
            <div className="group_drawer_item_title">{curCve.showName}</div>
            {role !== GroupRole.NOMAL ? (
              <div
                onClick={() => changeType("edit_group_info")}
                className="group_drawer_item_sub"
              >
                修改群信息
              </div>
            ) : null}
          </div>
        </div>
        <RightOutlined />
      </div>
      <div className="group_drawer_row">
        <div
          onClick={() => changeType("member_list")}
          className="group_drawer_row_title"
        >
          <div>群成员</div>
          <div>
            <span className="num_tip">{groupMembers.length}</span>
            <RightOutlined />
          </div>
        </div>
        <div className="group_drawer_row_input">
          <Input placeholder="搜索" prefix={<SearchOutlined />} />
        </div>
        <div className="group_drawer_row_icon">
          {groupMembers!.length > 0
            ? groupMembers!.map((gm, idx) => {
                if (idx < (role !== GroupRole.NOMAL ? 7 : 6)) {
                  return (
                    <MyAvatar
                      key={gm.userId}
                      shape="square"
                      size={32.8}
                      src={gm.faceUrl}
                      icon={<UserOutlined />}
                    />
                  );
                }
              })
            : null}
          <PlusOutlined onClick={inviteToGroup} />
          {role !== GroupRole.NOMAL && <MinusOutlined onClick={delInGroup} />}
        </div>
      </div>
      <div onClick={toManage} className="group_drawer_item">
        <div>群管理</div>
        <RightOutlined />
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>群昵称</div>
        <Paragraph
          editable={{
            tooltip: "点击编辑",
            maxLength: 15,
            onChange: () => {},
          }}
        >
          {"nickName"}
        </Paragraph>
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>群聊ID</div>
        <div className="group_id">{curCve.groupID}</div>
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>添加到置顶</div>
        <Switch
          checked={curCve.isPinned === 0 ? false : true}
          size="small"
          onChange={updatePin}
        />
      </div>
      <div className="group_drawer_item group_drawer_item_nbtm">
        <div>消息免打扰</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <div className="group_drawer_btns">
        <Button onClick={quitGroup} danger className="group_drawer_btns_item">
          退出群组
        </Button>
        {role === GroupRole.OWNER ? (
          <Button type="primary" danger className="group_drawer_btns_item">
            解散群组
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default GroupDrawer;
