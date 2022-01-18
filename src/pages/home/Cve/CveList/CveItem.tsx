import { UserOutlined } from "@ant-design/icons";
import { message, Popover, Badge } from "antd";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Cve, Message } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { messageTypes, tipsTypes } from "../../../../constants/messageContentType";
import { setCveList } from "../../../../store/actions/cve";
import { formatDate, im, parseMessageType } from "../../../../utils";

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
      let text = cve.draftText
      const pattern = /\<img.*?\">/g
      const matchArr = text.match(pattern)
      if(matchArr&&matchArr.length > 0) {
        matchArr.map(matchRes=>{
          text = text.replaceAll(matchRes,t("Picture"))
        })
      }
      return t("Draft")+" " + text
    }
    return parseMessageType(pmsg,curUid);
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
