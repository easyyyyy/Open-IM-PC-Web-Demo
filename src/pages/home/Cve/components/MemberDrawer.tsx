import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Empty, Input, message, Modal, Tooltip } from "antd";
import { FC, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { debounce } from "throttle-debounce";
import { GroupMember } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { RootState } from "../../../../store";
import { im } from "../../../../utils";
import { GroupRole } from "../CveRightDrawer";

type MemberDrawerProps = {
  groupMembers: GroupMember[];
  role: GroupRole;
  selfID: string;
  gid: string;
};

const MemberDrawer: FC<MemberDrawerProps> = ({ groupMembers, role, selfID, gid }) => {
  const [searchStatus, setSearchStatus] = useState(false);
  const [searchList, setSearchList] = useState<GroupMember[]>([]);
  const member2Status = useSelector((state: RootState) => state.contacts.member2status, shallowEqual);

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

  const MemberItem = ({ item }: { item: GroupMember }) => (
    <div className="group_members_list_item">
      <div style={{ display: "flex" }}>
        <MyAvatar size={36} src={item.faceUrl} />
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

  const onSearch = (e: any) => {
    if (e.key === "Enter") {
      const text = e.target.value;
      if (text !== "") {
        const tmpArr = groupMembers.filter((gm) => gm.userId.indexOf(text) > -1 || gm.nickName.indexOf(text) > -1);
        setSearchList(tmpArr);
        setSearchStatus(true);
      }
    }
  };

  const search = (text: string) => {
    const tmpArr = groupMembers.filter((gm) => gm.userId.indexOf(text) > -1 || gm.nickName.indexOf(text) > -1);
    setSearchList(tmpArr);
    setSearchStatus(true);
  };

  const debounceSearch = debounce(500, search);

  const inputOnChange = (e: any) => {
    if (e.target.value === "") {
      setSearchList([]);
      setSearchStatus(false);
    } else {
      debounceSearch(e.target.value);
    }
  };

  return (
    <div className="group_members">
      <div className="group_members_search">
        <Input onKeyDown={onSearch} onChange={inputOnChange} placeholder="搜索" prefix={<SearchOutlined />} />
      </div>
      <div className="group_members_list">
        {searchStatus && searchList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无该成员" />
        ) : (
          (searchStatus ? searchList : groupMembers).map((g) => <MemberItem key={g.userId} item={g} />)
        )}
      </div>
    </div>
  );
};

export default MemberDrawer;
