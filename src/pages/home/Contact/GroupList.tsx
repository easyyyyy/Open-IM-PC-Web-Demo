import { UserOutlined } from "@ant-design/icons";
import { shallowEqual, useSelector } from "react-redux";
import { FriendItem, GroupItem } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
import { sessionType } from "../../../constants/messageContentType";
import { RootState } from "../../../store";

const GroupList = ({clickItem}:{clickItem:(item:FriendItem|GroupItem,type:sessionType)=>void}) =>{
    const selectGroup = (state:RootState) => state.contacts.groupList
    const groupList = useSelector(selectGroup,shallowEqual)

    const GroupListItem = ({gp}:{gp:GroupItem}) =>(
        <div onDoubleClick={()=>clickItem(gp,sessionType.GROUPCVE)} className="group_item">
              <MyAvatar shape="square" size={36} src={gp.faceUrl} icon={<UserOutlined/>} />
              <div className="group_item_info">
                  <div className="group_item_title">{gp.groupName}</div>
                  <div className="group_item_sub">{`${gp.memberCount}人`}</div>
              </div>
          </div>
    )
    return (
      <div className="group_bg">
          {
              groupList.map(gp=><GroupListItem key={gp.groupID} gp={gp}/>)
          }
      </div>
    )
}

export default GroupList;