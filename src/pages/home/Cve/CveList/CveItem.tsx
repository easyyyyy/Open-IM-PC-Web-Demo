import { UserOutlined } from "@ant-design/icons";
import { message, Popover, Badge } from "antd";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Cve, Message } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { messageTypes, tipsTypes } from "../../../../constants/messageContentType";
import { setCveList } from "../../../../store/actions/cve";
import { formatDate, im } from "../../../../utils";

type CveItemProps = {
  cve: Cve;
  onClick: (cve: Cve) => void;
  curCve: Cve | null;
  curUid: string;
  cveList: Cve[];
};

const CveItem: FC<CveItemProps> = ({ cve, onClick, curCve, curUid, cveList }) => {
  const [popVis, setPopVis] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const parseLatestMsg = (lmsg: string): string => {
    const pmsg: Message = JSON.parse(lmsg);

    if (cve.draftText !== "") {
      return t("Draft")+" " + cve.draftText;
    }
    switch (pmsg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return pmsg.content;
      case messageTypes.ATTEXTMESSAGE:
        return `${pmsg.senderNickName + " " + pmsg.atElem.text}`;
      case messageTypes.PICTUREMESSAGE:
        return t("PictureMessage");
      case messageTypes.VIDEOMESSAGE:
        return t("VideoMessage");
      case messageTypes.VOICEMESSAGE:
        return t("VoiceMessage");
      case messageTypes.LOCATIONMESSAGE:
        return t("LocationMessage");
      case messageTypes.CARDMESSAGE:
        return t("CardMessage");
      case messageTypes.MERGERMESSAGE:
        return t("MergeMessage");
      case messageTypes.FILEMESSAGE:
        return t("FileMessage");
      case messageTypes.REVOKEMESSAGE:
        return `${pmsg.sendID === curUid ? t("You") : pmsg.senderNickName} ${t("RevokeMessage")}`;
      case messageTypes.CUSTOMMESSAGE:
        return t("CustomMessage");
      case messageTypes.QUOTEMESSAGE:
        return t("QuoteMessage");
      case tipsTypes.ACCEPTFRIENDNOTICE:
        return t("AlreadyFriend");
      case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
        const jointip = JSON.parse(pmsg.content).defaultTips;
        const joinIdx = jointip.indexOf(" join the group");
        return jointip.slice(0, joinIdx) + " "+  t("JoinedGroup");
      case tipsTypes.CREATEGROUPNOTICE:
        return t("AlreadyGroup");
      case tipsTypes.INVITETOGROUPNOTICE:
        const invitetip = JSON.parse(pmsg.content).defaultTips;
        const inviteIdx = invitetip.indexOf(" invited into the group chat by ");
        return invitetip.slice(32 + inviteIdx)+t("Invited") +invitetip.slice(0, inviteIdx)+ t("IntoGroup");
      case tipsTypes.QUITGROUPNOTICE:
        const quitTip = JSON.parse(pmsg.content).defaultTips;
        const quitIdx = quitTip.indexOf(" have quit group chat");
        return quitTip.slice(6, quitIdx) + t("QuitedGroup");
      default:
        const tip = JSON.parse(pmsg.content);
        if (tip.isDisplay === 1) {
          return tip.defaultTips;
        } else {
          return "tips";
        }
    }
  };

  const parseLatestTime = (ltime: number): string => {
    const sendArr = formatDate(ltime / 1000000);
    const dayArr = formatDate(ltime / 1000000 + 86400000);
    const curArr = formatDate(new Date().getTime());
    if (sendArr[3] === curArr[3]) {
      return sendArr[4] as string;
    } else if (dayArr[3] === curArr[3]) {
      return t("Yesterday");
    } else {
      return sendArr[3] as string;
    }
  };

  const isPin = () => {
    const options = {
      conversationID: cve.conversationID,
      isPinned: cve.isPinned === 0 ? true : false,
    };
    im.pinConversation(options)
      .then((res) => {
        message.success(cve.isPinned === 0 ? t("PinSuc") : t("CancelPinSuc"));
        cve.isPinned = cve.isPinned === 0 ? 1 : 0;
      })
      .catch((err) => {});
  };

  const markAsRead = () => {
    if (cve.userID) {
      im.markSingleMessageHasRead(cve.userID);
    } else {
      im.markGroupMessageHasRead(cve.groupID);
    }
  };

  const delCve = () => {
    im.deleteConversation(cve.conversationID)
      .then((res) => {
        const tarray = [...cveList];
        const farray = tarray.filter((c) => c.conversationID !== cve.conversationID);
        dispatch(setCveList(farray));
      })
      .catch((err) => message.error(t("AccessFailed")));
  };

  const PopContent = () => (
    <div onClick={() => setPopVis(false)} className="menu_list">
      <div className="item" onClick={isPin}>
        {cve.isPinned ? t("CancelPin") : t("Pin")}
      </div>
      {cve.unreadCount > 0 && (
        <div className="item" onClick={markAsRead}>
          {t("MarkAsRead")}
        </div>
      )}
      <div className="item" onClick={delCve}>
        {t("RemoveCve")}
      </div>
    </div>
  );

  return (
    <Popover
      visible={popVis}
      onVisibleChange={(v) => setPopVis(v)}
      placement="bottomRight"
      overlayClassName="cve_item_menu"
      key={cve.conversationID}
      content={PopContent}
      title={null}
      trigger="contextMenu"
    >
      <div onClick={() => onClick(cve)} className={`cve_item ${curCve?.conversationID === cve.conversationID || cve.isPinned === 1 ? "cve_item_focus" : ""}`}>
        <Badge size="small" count={cve.unreadCount}>
          <MyAvatar shape="square" style={{ minWidth: "36px" }} size={36} icon={<UserOutlined />} src={cve.faceUrl} />
        </Badge>

        <div className="cve_info">
          <div data-time={parseLatestTime(cve.latestMsgSendTime)} className="cve_title">
            {cve.showName}
          </div>
          <div className="cve_msg" dangerouslySetInnerHTML={{__html:parseLatestMsg(cve.latestMsg)}}></div>
        </div>
      </div>
    </Popover>
  );
};

export default CveItem;
