import { DeleteOutlined } from "@ant-design/icons";
import { Modal, message, Tooltip, Skeleton } from "antd";
import { FC, useRef } from "react";
import { GroupMember, MemberMapType } from "../../../../../@types/open_im";
import LayLoad from "../../../../../components/LayLoad";
import { MyAvatar } from "../../../../../components/MyAvatar";
import { im } from "../../../../../utils";
import { GroupRole } from "../CveRightDrawer";

type MemberItemProps = {
  item: GroupMember;
  member2Status: MemberMapType;
  role: GroupRole;
  gid: string;
  selfID: string;
  idx: number;
};

const MemberItem: FC<MemberItemProps> = ({ idx, item, member2Status, role, gid, selfID }) => {
  const memberItemRef = useRef<HTMLDivElement>(null);

  const parseStatus = (userID: string) => {
    let str = "离线";
    const item = member2Status[userID];
    if (item) {
      if (item.status === "online") {
        str = "";
        item.detailPlatformStatus?.map((pla) => {
          if (pla.status === "online") {
            str += `${pla.platform}/`;
          }
        });
        str = `${str.slice(0, -1)}在线`;
      }
    }
    return `[${str}]`;
  };

  const warning = (item: GroupMember) => {
    Modal.confirm({
      title: "移除群成员",
      content: `移除后，${item.nickName} 将无法接收该会话的信息`,
      cancelText: "取消",
      okText: "移除",
      okButtonProps: {
        danger: true,
        type: "primary",
      },
      closable: false,
      className: "warning_modal",
      onOk: () => removeMember(item.userId),
    });
  };

  const removeMember = (id: string) => {
    const options = {
      groupId: gid,
      reason: "kick",
      userList: [id],
    };
    im.kickGroupMember(options)
      .then((res) => {
        message.success("踢出成功！");
      })
      .catch((err) => message.error("踢出失败！"));
  };

  const RemoveIcon = ({ item }: { item: GroupMember }) => (
    <Tooltip placement="left" title="移除成员">
      <DeleteOutlined onClick={() => warning(item)} />
    </Tooltip>
  );

  const getPermission = (item: GroupMember) => {
    if (role === GroupRole.OWNER) {
      if (item.role !== 1) {
        return <RemoveIcon item={item} />;
      }
    } else if (role === GroupRole.ADMIN) {
      if (item.role !== 1 && item.userId !== selfID) {
        return <RemoveIcon item={item} />;
      }
    }
    return null;
  };

  const switchTip = (role: number) => {
    switch (role) {
      case 0:
        return null;
      case 1:
        return <div className="owner_tip">群主</div>;
      case 2:
        return <div className="admin_tip">管理员</div>;
      default:
        break;
    }
  };
  return (
    <div ref={memberItemRef} className="group_members_list_item">
      <div style={{ display: "flex" }}>
          <LayLoad forceLoad={idx>20?false:true} targetRef={memberItemRef} skeletonCmp={<Skeleton.Avatar active={true} size={36} shape="square" />}>
            <MyAvatar size={36} src={item.faceUrl} />
          </LayLoad>
        <div className="member_info">
          <div className="title">
            <div>{item.nickName}</div>
            {switchTip(item.role)}
          </div>
          <div className="member_status">{parseStatus(item.userId)}</div>
        </div>
      </div>
      {getPermission(item)}
    </div>
  );
};

export default MemberItem;
