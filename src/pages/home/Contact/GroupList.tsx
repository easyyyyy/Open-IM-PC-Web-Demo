import { UserOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import { shallowEqual, useSelector } from "react-redux";
import { FriendItem, GroupItem } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
import { SessionType } from "../../../constants/messageContentType";
import { RootState } from "../../../store";

const GroupList = ({ clickItem }: { clickItem: (item: FriendItem | GroupItem, type: SessionType) => void }) => {
  const selectGroup = (state: RootState) => state.contacts.groupList;
  const groupList = useSelector(selectGroup, shallowEqual);

  const GroupListItem = ({ gp }: { gp: GroupItem }) => (
    <div onDoubleClick={() => clickItem(gp, SessionType.GROUPCVE)} className="group_item">
      <MyAvatar shape="square" size={36} src={gp.faceUrl} icon={<UserOutlined />} />
      <div className="group_item_info">
        <div className="group_item_title">{gp.groupName}</div>
        <div className="group_item_sub">{`${gp.memberCount}人`}</div>
      </div>
    </div>
  );
  return (
    <div className="group_bg">
      {groupList.length > 0 ? groupList.map((gp) => <GroupListItem key={gp.groupID} gp={gp} />) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无群组" />}
    </div>
  );
};

export default GroupList;
