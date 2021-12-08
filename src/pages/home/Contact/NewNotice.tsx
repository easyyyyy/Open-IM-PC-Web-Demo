import { UserOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { FriendApplication, GroupApplication } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { getGroupApplicationList } from "../../../store/actions/contacts";
import { im } from "../../../utils";

const NewNotice = ({ type }: { type: number }) => {
  const selectFriendApplication = (state: RootState) =>
    state.contacts.friendApplicationList;
  const friendApplicationList = useSelector(
    selectFriendApplication,
    shallowEqual
  );
  const selectGroupApplication = (state: RootState) =>
    state.contacts.groupApplicationList;
  const groupApplicationList = useSelector(
    selectGroupApplication,
    shallowEqual
  );

  const NoticeItem = ({ap}:{ap:FriendApplication | GroupApplication}) => {
    const dispatch = useDispatch()
    const acceptApplication = () => {
        if(type===1){
            im.acceptFriendApplication((ap as FriendApplication).uid)
                .then(res=>{
                    ap.flag = 1
                    message.success("添加好友成功！")
                }).catch(err=>message.error("操作失败！"))
        }else{
            const options = {
                application: JSON.stringify(ap),
                reason:"accept"
            }
            im.acceptGroupApplication(options)
                .then(res=>{
                    // ap.flag = 1
                    dispatch(getGroupApplicationList())
                    message.success("同意入群成功！")
                }).catch(err=>message.error("操作失败！"))
        }
    };
    const refuseApplication = () => {
        if(type===1){
            im.refuseFriendApplication((ap as FriendApplication).uid)
                .then(res=>{
                    ap.flag = -1
                }).catch(err=>message.error("操作失败！"))
        }else{
            const options = {
                application: JSON.stringify(ap),
                reason:"refuse"
            }
            im.refuseGroupApplication(options)
                .then(res=>{
                    ap.flag = -1
                }).catch(err=>message.error("操作失败！"))
        }
    };

    return (
      <div className="notice_bg_item">
        <div
          className="notice_bg_item_left"
          style={{ alignItems: "flex-start" }}
        >
          <MyAvatar icon={<UserOutlined />} size={36} shape="square" src={type===1?(ap as FriendApplication).icon:(ap as GroupApplication).fromUserFaceURL} />
          {type === 1 ? (
            <div className="notice_friend">
              <div className="notice_friend_title">{(ap as FriendApplication).name}</div>
              <div className="notice_friend_sub">{(ap as FriendApplication).reqMessage}</div>
            </div>
          ) : (
            <div className="notice_group">
              <div className="notice_group_title">{(ap as GroupApplication).fromUserNickName}</div>
              <div className="notice_group_sub">
                申请加入 <span style={{ color: "#428BE5" }}>{(ap as GroupApplication).groupID}</span>
              </div>
              <div className="notice_group_res">申请理由：</div>
              <div className="notice_group_res">{(ap as GroupApplication).reqMsg}</div>
            </div>
          )}
        </div>
        <div className="notice_bg_item_right">
          {ap.flag===0 ? (
            <>
              <Button onClick={() => acceptApplication()} type="primary">
                接受
              </Button>
              <Button onClick={() => refuseApplication()}>拒绝</Button>
            </>
          ) : (
            <div className="apt_result">{ap.flag===-1?'已拒绝':'已添加'}</div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="notice_bg">
      {type === 1
        ? friendApplicationList.map((fp) => <NoticeItem key={fp.uid} ap={fp} />)
        : groupApplicationList.map((gp) => <NoticeItem key={gp.id} ap={gp} />)}
    </div>
  );
};

export default NewNotice;
