import { LoadingOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Spin, Checkbox } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { Message, PictureElem, Cve } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { messageTypes } from "../../../../constants/messageContentType";
import { events, im, isSingleCve } from "../../../../utils";

import { ATSTATEUPDATE, MUTILMSGCHANGE, OPENSINGLEMODAL } from "../../../../constants/events";
import { useInViewport, useLongPress } from "ahooks";

import SwitchMsgType from "./SwitchMsgType/SwitchMsgType";
import MsgMenu from "./MsgMenu/MsgMenu";
import { useTranslation } from "react-i18next";

type MsgItemProps = {
  msg: Message;
  selfID: string;
  imgClick: (el: PictureElem) => void;
  clickItem: (uid: string) => void;
  audio: React.RefObject<HTMLAudioElement>;
  curCve: Cve;
  mutilSelect?: boolean;
};

const canCpTypes = [messageTypes.TEXTMESSAGE, messageTypes.ATTEXTMESSAGE];

const MsgItem: FC<MsgItemProps> = (props) => {
  const { msg, selfID, curCve, clickItem, mutilSelect, audio } = props;

  const [lastChange, setLastChange] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const avaRef = useRef<HTMLDivElement>(null);
  const msgItemRef = useRef<HTMLDivElement>(null);
  const [ inViewport ] = useInViewport(msgItemRef);
  const { t } = useTranslation();

  useEffect(() => {
    //@ts-ignore
    window.spanClick = async (id: string) => {
      const { data } = await im.getUsersInfo([id]);
      events.emit(OPENSINGLEMODAL, JSON.parse(data)[0]);
    };
    //@ts-ignore
    window.urlClick = (url:string) => {
      if(url.indexOf('http')===-1&&url.indexOf("https")===-1){
        url = `http://${url}`
      }
      window.open(url,'_blank')
    }
  }, []);

  useEffect(() => {
    if (lastChange) {
      setLastChange(false);
    }
  }, [mutilSelect]);

  useEffect(()=>{
    if(inViewport && curCve.userID===msg.sendID && !msg.isRead){
      markC2CHasRead(msg.sendID,msg.clientMsgID)
    }
  },[inViewport,curCve])

  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const markC2CHasRead = (receiver: string, msgID: string) => {
    im.markC2CMessageAsRead({ receiver, msgIDList:[msgID] })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const switchTip = () => {
    switch (msg.status) {
      case 1:
        return <Spin indicator={antIcon} />;
      case 2:
        if (curCve && isSingleCve(curCve)) {
          return msg.isRead ? t("Readed") : t("UnRead");
        }
        return null;
      case 3:
        return <ExclamationCircleFilled style={{ color: "#f34037", fontSize: "20px" }} />;
      default:
        break;
    }
  };

  const switchStyle = () => {
    if (isSelf(msg.sendID)) {
      return {
        marginLeft: "12px",
      };
    } else {
      return {
        marginRight: "12px",
      };
    }
  };

  const mutilCheckItem = () => {
    if (mutilSelect && canCpTypes.includes(msg.contentType)) {
      events.emit(MUTILMSGCHANGE, !lastChange, msg);
      setLastChange((v) => !v);
    }
  };

  const avatarLongPress = () => {
    if (!isSingleCve(curCve!)) {
      events.emit(ATSTATEUPDATE, msg.sendID, msg.senderNickName);
    }
  };

  useLongPress(avatarLongPress, avaRef, {
    onClick: () => clickItem(msg.sendID),
    delay: 500,
  });

  return (
    <div ref={msgItemRef} onClick={mutilCheckItem} className={`chat_bg_msg ${isSelf(msg.sendID) ? "chat_bg_omsg" : ""}`}>
      {mutilSelect && (
        <div style={switchStyle()} className="chat_bg_msg_check">
          <Checkbox disabled={!canCpTypes.includes(msg.contentType)} checked={lastChange} />
        </div>
      )}

      <div className="cs" ref={avaRef}>
        <MyAvatar className="chat_bg_msg_icon" shape="square" size={42} src={msg.senderFaceUrl} />
      </div>

      <div className="chat_bg_msg_content">
        {(!curCve || !isSingleCve(curCve)) && <span className="nick">{msg.senderNickName}</span>}
        <MsgMenu key={msg.clientMsgID} visible={contextMenuVisible} msg={msg} isSelf={isSelf(msg.sendID)} visibleChange={(v) => setContextMenuVisible(v)}>
          <SwitchMsgType {...props} />
        </MsgMenu>
      </div>

      {isSelf(msg.sendID) ? (
        <div style={{ color: msg.isRead ? "#999" : "#428BE5", marginTop: curCve && isSingleCve(curCve) ? "0" : "24px" }} className="chat_bg_flag">
          {switchTip()}
        </div>
      ) : null}
    </div>
  );
};

export default MsgItem;
