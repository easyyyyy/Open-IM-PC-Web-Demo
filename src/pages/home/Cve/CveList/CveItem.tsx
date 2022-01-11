import { UserOutlined } from "@ant-design/icons";
import { message, Popover, Badge } from "antd";
import React, { FC, useState } from "react";
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

  const parseLatestMsg = (lmsg: string): string => {
    const pmsg: Message = JSON.parse(lmsg);

    if (cve.draftText !== "") {
      return "[草稿] " + cve.draftText;
    }
    switch (pmsg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return pmsg.content;
      case messageTypes.ATTEXTMESSAGE:
        return `${pmsg.senderNickName + " " + pmsg.atElem.text}`;
      case messageTypes.PICTUREMESSAGE:
        return "[图片消息]";
      case messageTypes.VIDEOMESSAGE:
        return "[视频消息]";
      case messageTypes.VOICEMESSAGE:
        return "[语音消息]";
      case messageTypes.LOCATIONMESSAGE:
        return "[位置消息]";
      case messageTypes.CARDMESSAGE:
        return "[名片信息]";
      case messageTypes.MERGERMESSAGE:
        return "[合并转发消息]";
      case messageTypes.FILEMESSAGE:
        return "[文件消息]";
      case messageTypes.REVOKEMESSAGE:
        return `${pmsg.sendID === curUid ? "你" : pmsg.senderNickName}撤回了一条消息`;
      case messageTypes.CUSTOMMESSAGE:
        return "[自定义消息]";
      case messageTypes.QUOTEMESSAGE:
        return "[引用消息]";
      case tipsTypes.ACCEPTFRIENDNOTICE:
        return "你们已经是好友啦，开始聊天吧~";
      case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
        const jointip = JSON.parse(pmsg.content).defaultTips;
        const joinIdx = jointip.indexOf(" join the group");
        return `${jointip.slice(0, joinIdx)} 加入了群聊`;
      case tipsTypes.CREATEGROUPNOTICE:
        return "你已成功加入群聊";
      case tipsTypes.INVITETOGROUPNOTICE:
        const invitetip = JSON.parse(pmsg.content).defaultTips;
        const inviteIdx = invitetip.indexOf(" invited into the group chat by ");
        return `${invitetip.slice(32 + inviteIdx)}邀请了${invitetip.slice(0, inviteIdx)}入群`;
      case tipsTypes.QUITGROUPNOTICE:
        const quitTip = JSON.parse(pmsg.content).defaultTips;
        const quitIdx = quitTip.indexOf(" have quit group chat");
        return `${quitTip.slice(6, quitIdx)} 退出了群聊`;
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
      return "昨天";
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
        message.success(cve.isPinned === 0 ? "置顶成功!" : "取消置顶成功!");
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
      .catch((err) => message.error("移除失败！"));
  };

  const PopContent = () => (
    <div onClick={() => setPopVis(false)} className="menu_list">
      <div className="item" onClick={isPin}>
        {cve.isPinned ? "取消置顶" : "置顶"}
      </div>
      {cve.unreadCount > 0 && (
        <div className="item" onClick={markAsRead}>
          标记已读
        </div>
      )}
      <div className="item" onClick={delCve}>
        移除会话
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
