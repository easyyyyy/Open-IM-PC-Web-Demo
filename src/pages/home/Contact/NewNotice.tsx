import { UserOutlined } from "@ant-design/icons";
import { Button, Empty, message } from "antd";
import { useTranslation } from "react-i18next";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { FriendApplication, GroupApplication } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
import { RootState } from "../../../store";
import { getGroupApplicationList } from "../../../store/actions/contacts";
import { im } from "../../../utils";

const NewNotice = ({ type }: { type: number }) => {
  const selectFriendApplication = (state: RootState) => state.contacts.friendApplicationList;
  const friendApplicationList = useSelector(selectFriendApplication, shallowEqual);
  const selectGroupApplication = (state: RootState) => state.contacts.groupApplicationList;
  const groupApplicationList = useSelector(selectGroupApplication, shallowEqual);
  const { t } = useTranslation();

  const NoticeItem = ({ ap }: { ap: FriendApplication | GroupApplication }) => {
    const dispatch = useDispatch();
    const acceptApplication = () => {
      if (type === 1) {
        im.acceptFriendApplication((ap as FriendApplication).uid)
          .then((res) => {
            ap.flag = 1;
            message.success(t("AddFriendSuc"));
          })
          .catch((err) => message.error(t("AccessFailed")));
      } else {
        const options = {
          application: JSON.stringify(ap),
          reason: "accept",
        };
        im.acceptGroupApplication(options)
          .then((res) => {
            // ap.flag = 1
            dispatch(getGroupApplicationList());
            message.success(t("AgreeJoin"));
          })
          .catch((err) => message.error(t("AccessFailed")));
      }
    };
    const refuseApplication = () => {
      if (type === 1) {
        im.refuseFriendApplication((ap as FriendApplication).uid)
          .then((res) => {
            ap.flag = -1;
          })
          .catch((err) => message.error(t("AccessFailed")));
      } else {
        const options = {
          application: JSON.stringify(ap),
          reason: "refuse",
        };
        im.refuseGroupApplication(options)
          .then((res) => {
            ap.flag = -1;
          })
          .catch((err) => message.error(t("AccessFailed")));
      }
    };

    return (
      <div className="notice_bg_item">
        <div className="notice_bg_item_left" style={{ alignItems: "flex-start" }}>
          <MyAvatar icon={<UserOutlined />} size={36} shape="square" src={type === 1 ? (ap as FriendApplication).icon : (ap as GroupApplication).fromUserFaceURL} />
          {type === 1 ? (
            <div className="notice_friend">
              <div className="notice_friend_title">{(ap as FriendApplication).name}</div>
              <div className="notice_friend_sub">{(ap as FriendApplication).reqMessage}</div>
            </div>
          ) : (
            <div className="notice_group">
              <div className="notice_group_title">{(ap as GroupApplication).fromUserNickName}</div>
              <div className="notice_group_sub">
                {t("ApplyJoin")} <span style={{ color: "#428BE5" }}>{(ap as GroupApplication).groupID}</span>
              </div>
              <div className="notice_group_res">{t("ApplyReason")}：</div>
              <div className="notice_group_res">{(ap as GroupApplication).reqMsg}</div>
            </div>
          )}
        </div>
        <div className="notice_bg_item_right">
          {ap.flag === 0 ? (
            <>
              <Button onClick={() => acceptApplication()} type="primary">
                {t("Accept")}
              </Button>
              <Button onClick={() => refuseApplication()}>{t("Refuse")}</Button>
            </>
          ) : (
            <div className="apt_result">{ap.flag === -1 ? t("Refused") : t("Accepted")}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="notice_bg">
      {(type === 1 && friendApplicationList.length === 0) || (type === 2 && groupApplicationList.length === 0) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoNotice")} />
      ) : (
        (type === 1 ? friendApplicationList : groupApplicationList).map((fp) => <NoticeItem key={(fp as FriendApplication).uid ?? (fp as GroupApplication).id} ap={fp} />)
      )}
    </div>
  );
};

export default NewNotice;
