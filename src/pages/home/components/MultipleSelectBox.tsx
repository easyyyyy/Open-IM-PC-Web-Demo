import user_select from "@/assets/images/select_user.png";
import group_select from "@/assets/images/select_group.png";
import { FC, useEffect, useState } from "react";
import { CloseOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import { Checkbox, Empty, Input } from "antd";
import { MyAvatar } from "../../../components/MyAvatar";
import { FriendItem, GroupItem, GroupMember } from "../../../@types/open_im";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useReactive } from "ahooks";
import { ModalType } from "./GroupOpModal";
import { useTranslation } from "react-i18next";

type MultipleSelectBoxProps = {
  modalType:ModalType;
  memberList?: SelectMemberItem[];
  friendList: SelectFriendItem[];
  groupList?: SelectGroupItem[];
  onSelectedChange: (selectList:SelectType[]) => void
};

export type ChechType = {
  check: boolean;
  disabled: boolean;
};
export type SelectFriendItem = FriendItem & ChechType;
export type SelectMemberItem = GroupMember & ChechType;
export type SelectGroupItem = GroupItem & ChechType;
export type SelectType = SelectFriendItem | SelectGroupItem | SelectMemberItem;

type RSType = {
  searchText: string;
  searchList: SelectType[];
  selectedList: SelectType[];
  friendList: SelectFriendItem[];
  memberList: SelectMemberItem[];
  groupList: SelectGroupItem[];
};

const MultipleSelectBox: FC<MultipleSelectBoxProps> = ({ modalType,memberList, friendList, groupList,onSelectedChange }) => {
  const [type, setType] = useState<"friend" | "group" | undefined>();
  const rs = useReactive<RSType>({
    searchText: "",
    searchList: [],
    selectedList: [],
    friendList: [],
    memberList: [],
    groupList: [],
  });
  const { t } = useTranslation();

  useEffect(() => {
    rs.friendList = [...friendList];
    rs.memberList = [...(memberList ?? [])];
    rs.groupList = [...(groupList ?? [])];
  }, [memberList, friendList, groupList]);

  const searchUser = (text: string) => {
    rs.searchText = text;
    if (text) {
      let arr = rs.friendList.filter((f) => f.uid.indexOf(text) > -1 || f.name.indexOf(text) > -1);
      rs.searchList = [...arr];
    } else {
      rs.searchList = [];
    }
  };

  const leftItemClick = (e: CheckboxChangeEvent, item: SelectType) => {
    if (e.target.checked) {
      //@ts-ignore
      rs.selectedList = [...rs.selectedList, item];
      onSelectedChange(rs.selectedList)
    } else {
      cancelSelect(item);
    }
    item.check = e.target.checked;
  };

  const cancelSelect = (item: SelectType) => {
    let idx;
    if ((item as SelectMemberItem).userId) {
      idx = rs.selectedList.findIndex((s) => (s as SelectMemberItem).userId == (item as SelectMemberItem).userId);
    } else if ((item as SelectFriendItem).uid) {
      idx = rs.selectedList.findIndex((s) => (s as SelectFriendItem).uid == (item as SelectFriendItem).uid);
    } else {
      idx = rs.selectedList.findIndex((s) => (s as SelectGroupItem).groupID == (item as SelectGroupItem).groupID);
    }
    rs.selectedList.splice(idx, 1);
    item.check = false;
    onSelectedChange(rs.selectedList)
  };

  const LeftMenu = () => (
    <>
      <div onClick={() => setType("friend")} className="select_box_left_item">
        <div className="left_title">
          <img style={{ width: "20px" }} src={user_select} />
          <span>{t("MyFriends")}</span>
        </div>
        <RightOutlined />
      </div>
      <div onClick={() => setType("group")} className="select_box_left_item">
        <div className="left_title">
          <img style={{ width: "20px" }} src={group_select} />
          <span>{t("MyGruops")}</span>
        </div>
        <RightOutlined />
      </div>
    </>
  );

  const LeftSelectItem = ({ item }: { item: SelectType }) => {
    return (
      <div className="select_box_left_item">
        <Checkbox disabled={item.disabled} checked={item.check} onChange={(e) => leftItemClick(e, item)}>
          <MyAvatar src={(item as SelectFriendItem).icon || (item as SelectMemberItem | SelectGroupItem).faceUrl} size={32} />
          <span className="title">
            {(item as SelectFriendItem).comment || (item as SelectFriendItem).name || (item as SelectMemberItem).nickName || (item as SelectGroupItem).groupName}
          </span>
        </Checkbox>
      </div>
    );
  };
  const LeftSelect = () => (
    <>
      <div className="select_box_left_title">
        <div>
          <span className="index_tab" onClick={() => setType(undefined)}>
            {t("Contact")} &gt;{" "}
          </span>
          <span>{type==="friend"?t("MyFriends"):t("MyGruops")}</span>
        </div>
      </div>
      {type === "friend" ? (
        rs.friendList.map((f) => <LeftSelectItem item={f} key={f.uid} />)
      ) : modalType==="forward" ? (
        rs.groupList.map((g) => <LeftSelectItem item={g} key={g.groupID} />)
      ) : (
        <div>{t("NotSupport")}</div>
      )}
    </>
  );

  const RightSelectItem = ({ item }: { item: SelectType }) => (
    <div className="select_box_right_item">
      <div className="select_info">
        <MyAvatar src={(item as SelectFriendItem).icon || (item as SelectMemberItem | SelectGroupItem).faceUrl} size={32} />
        <span className="select_info_title">{(item as SelectFriendItem).name || (item as SelectMemberItem).nickName || (item as SelectGroupItem).groupName}</span>
      </div>
      <CloseOutlined onClick={() => cancelSelect(item)} />
    </div>
  );

  return (
    <div className="group_info_item">
      <div className="group_info_label">{t("Invite")}</div>
      <div className="select_box">
        <div className="select_box_left">
          <Input onChange={(e) => searchUser(e.target.value)} placeholder={t("SearchFriendGroup")} prefix={<SearchOutlined />} />
          {rs.memberList && rs.memberList.length > 0 ? (
            rs.memberList.map((m) => <LeftSelectItem key={m.userId} item={m} />)
          ) : rs.searchList.length > 0 ? (
            //@ts-ignore
            rs.searchList.map((s) => <LeftSelectItem key={s.uid ?? s.userId ?? s.groupID} item={s} />)
          ) : rs.searchText !== "" ? (
            <Empty description={t("SearchEmpty")} />
          ) : type ? (
            <LeftSelect />
          ) : (
            <LeftMenu />
          )}
        </div>
        <div className="select_box_right">
          <div className="select_box_right_title">{`${t("Selected")}：${rs.selectedList.length+t("People")}`}</div>
          {rs.selectedList.map((s) => (
            <RightSelectItem key={(s as SelectFriendItem).uid || (s as SelectMemberItem).userId || (s as SelectGroupItem).groupID} item={s} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectBox;
