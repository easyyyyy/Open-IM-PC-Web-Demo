import { SearchOutlined } from "@ant-design/icons";
import { Empty, Input, message, Modal, Tooltip } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, shallowEqual } from "react-redux";
import { debounce } from "throttle-debounce";
import { GroupMember } from "../../../../../@types/open_im";
import { RootState } from "../../../../../store";
import { GroupRole } from "../CveRightDrawer";
import MemberItem from "./MemberItem";

type MemberDrawerProps = {
  groupMembers: GroupMember[];
  role: GroupRole;
  selfID: string;
  gid: string;
};

const MemberDrawer: FC<MemberDrawerProps> = (props) => {
  const { groupMembers } = props;

  const [searchStatus, setSearchStatus] = useState(false);
  const [searchList, setSearchList] = useState<GroupMember[]>([]);
  const member2Status = useSelector((state: RootState) => state.contacts.member2status, shallowEqual);
  const { t } = useTranslation();

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
        <Input onKeyDown={onSearch} onChange={inputOnChange} placeholder={t("Search")} prefix={<SearchOutlined />} />
      </div>
      <div className="group_members_list">
        {searchStatus && searchList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("EmptySearch")} />
        ) : (
          (searchStatus ? searchList : groupMembers).map((g,idx) => <MemberItem key={g.userId} item={g} idx={idx} member2Status={member2Status} {...props} />)
        )}
      </div>
    </div>
  );
};

export default MemberDrawer;
