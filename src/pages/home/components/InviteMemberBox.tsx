import user_select from "@/assets/images/select_user.png";
import group_select from "@/assets/images/select_group.png";
import { FC } from "react";
import {
  CloseOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Checkbox, Empty, Input } from "antd";
import { MyAvatar } from "../../../components/MyAvatar";
import { FriendItem, GroupMember } from "../../../@types/open_im";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

type InviteMemberBoxProps = {
  type: "friend" | "group" | undefined;
  searchText: string;
  searchList: SelectFriendItem[];
  memberList?: SelectMemberItem[];
  selectedList: SelectFriendItem[] | SelectMemberItem[];
  friendList: SelectFriendItem[];
  clickMenu: (type: "friend" | "group" | undefined) => void;
  leftItemClick: (
    e: CheckboxChangeEvent,
    item: SelectFriendItem | SelectMemberItem
  ) => void;
  cancelSelect: (item: SelectFriendItem | SelectMemberItem) => void;
  searchUser: (text: string) => void;
};

export type SelectFriendItem = FriendItem & {
  check: boolean;
  disabled: boolean;
};
export type SelectMemberItem = GroupMember & {
  check: boolean;
  disabled: boolean;
};

const InviteMemberBox: FC<InviteMemberBoxProps> = ({
  type,
  searchText,
  searchList,
  memberList,
  selectedList,
  friendList,
  clickMenu,
  leftItemClick,
  cancelSelect,
  searchUser,
}) => {
  const LeftMenu = () => (
    <>
      <div onClick={() => clickMenu("friend")} className="select_box_left_item">
        <div className="left_title">
          <img style={{ width: "20px" }} src={user_select} />
          <span>我的好友</span>
        </div>
        <RightOutlined />
      </div>
      <div onClick={() => clickMenu("group")} className="select_box_left_item">
        <div className="left_title">
          <img style={{ width: "20px" }} src={group_select} />
          <span>我的群组</span>
        </div>
        <RightOutlined />
      </div>
    </>
  );

  const LeftSelectItem = ({
    item,
  }: {
    item: SelectFriendItem | SelectMemberItem;
  }) => {
    return (
      <div className="select_box_left_item">
        <Checkbox
          disabled={item.disabled}
          checked={item.check}
          onChange={(e) => leftItemClick(e, item)}
        >
          <MyAvatar
            src={
              (item as SelectFriendItem).icon ||
              (item as SelectMemberItem).faceUrl
            }
            size={32}
          />
          <span className="title">
            {(item as SelectFriendItem).comment ||
              (item as SelectFriendItem).name ||
              (item as SelectMemberItem).nickName}
          </span>
        </Checkbox>
      </div>
    );
  };
  const LeftSelect = () => (
    <>
      <div className="select_box_left_title">
        <div>
          <span className="index_tab" onClick={() => clickMenu(undefined)}>
            联系人 &gt;{" "}
          </span>
          <span>我的好友</span>
        </div>
      </div>
      {type === "friend" ? (
        friendList.map((f) => <LeftSelectItem item={f} key={f.uid} />)
      ) : (
        <div>暂不支持</div>
      )}
    </>
  );

  const RightSelectItem = ({
    item,
  }: {
    item: SelectFriendItem | SelectMemberItem;
  }) => (
    <div className="select_box_right_item">
      <div className="select_info">
        <MyAvatar
          src={
            (item as SelectFriendItem).icon ||
            (item as SelectMemberItem).faceUrl
          }
          size={32}
        />
        <span className="select_info_title">
          {(item as SelectFriendItem).name ||
            (item as SelectMemberItem).nickName}
        </span>
      </div>
      <CloseOutlined onClick={() => cancelSelect(item)} />
    </div>
  );

  return (
    <div className="group_info_item">
      <div className="group_info_label">邀请</div>
      <div className="select_box">
        <div className="select_box_left">
          <Input
            onChange={(e) => searchUser(e.target.value)}
            placeholder="搜索我的好友、群组"
            prefix={<SearchOutlined />}
          />
          {memberList && memberList.length > 0 ? (
            memberList.map((m) => <LeftSelectItem key={m.userId} item={m} />)
          ) : searchList.length > 0 ? (
            searchList.map((s) => <LeftSelectItem key={s.uid} item={s} />)
          ) : searchText !== "" ? (
            <Empty description="无搜索结果" />
          ) : type ? (
            <LeftSelect />
          ) : (
            <LeftMenu />
          )}
        </div>
        <div className="select_box_right">
          <div className="select_box_right_title">{`已选：${selectedList.length}人`}</div>
          {selectedList.map((s) => (
            <RightSelectItem
              key={
                (s as SelectFriendItem).uid || (s as SelectMemberItem).userId
              }
              item={s}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberBox;
