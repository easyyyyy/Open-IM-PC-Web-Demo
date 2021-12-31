import { LoadingOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Spin, Popover, Image, Tooltip, message, Modal, Checkbox } from "antd";
import { CSSProperties, FC, useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Message, PictureElem, Cve, MergeElem } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { messageTypes } from "../../../../constants/messageContentType";
import { events, formatDate, im, isSingleCve } from "../../../../utils";

import ts_msg from "@/assets/images/ts_msg.png";
import re_msg from "@/assets/images/re_msg.png";
import rev_msg from "@/assets/images/rev_msg.png";
import mc_msg from "@/assets/images/mc_msg.png";
import sh_msg from "@/assets/images/sh_msg.png";
import del_msg from "@/assets/images/del_msg.png";
import cp_msg from "@/assets/images/cp_msg.png";
import { DELETEMESSAGE, FORWARDANDMERMSG, MERMSGMODAL, MUTILMSG, MUTILMSGCHANGE, REPLAYMSG, REVOKEMSG } from "../../../../constants/events";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { faceMap } from "../../../../constants/faceType";

type MsgItemProps = {
  msg: Message;
  selfID: string;
  imgClick: (el: PictureElem) => void;
  clickItem: (uid: string) => void;
  curCve?: Cve;
  mutilSelect?: boolean;
};

const canCpTypes = [messageTypes.TEXTMESSAGE, messageTypes.ATTEXTMESSAGE];
const canHiddenTypes = ["复制", "翻译", "回复", "转发",];

const MsgItem: FC<MsgItemProps> = ({ msg, selfID, imgClick, curCve, clickItem, mutilSelect }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [sty, setSty] = useState<CSSProperties>({
    paddingRight: "40px",
  });
  const [isSingle, setIsSingle] = useState(false);
  const [lastChange, setLastChange] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    if (curCve) {
      setIsSingle(isSingleCve(curCve));
    } else {
      setIsSingle(false);
    }
    if (textRef.current?.clientHeight! > 60) {
      setSty({
        paddingBottom: "16px",
        paddingRight: "8px",
      });
    }
  }, []);

  useEffect(() => {
    if (lastChange) {
      setLastChange(false);
    }
  }, [mutilSelect]);

  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const parseTime = (type: 0 | 1) => {
    const arr = formatDate(msg.sendTime / 1000000);
    return type ? arr[4] : arr[3] + " " + arr[4];
  };

  const merClick = (el:MergeElem,sender:string) => {
    events.emit(MERMSGMODAL,el,sender)
  }

  const timeTip = (className:string="chat_bg_msg_content_time") =>(<Tooltip overlayClassName="msg_time_tip" placement="bottom" title={parseTime(0)}>
              <div className={className}>{parseTime(1)}</div>
            </Tooltip>)

  const parseEmojiFace = (mstr:string) => {
    faceMap.map(f=>{
      const idx = mstr.indexOf(f.context)
      if(idx>-1){
        mstr = mstr.replaceAll(f.context,`<img style="padding-right:2px" width="24px" src=${f.src} />`)
      }
    })
    return mstr;
  }

  const msgType = (msg: Message) => {
    switch (msg.contentType) {
      case messageTypes.TEXTMESSAGE:
        let mstr = msg.content;
        mstr = parseEmojiFace(mstr);
        return (
          <div>
            <div ref={textRef} style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
              <div dangerouslySetInnerHTML={{__html:mstr}}></div>
            </div>
            {timeTip()}
          </div>
        );
      case messageTypes.ATTEXTMESSAGE:
        let atStr = "";
        let text = msg.atElem.text;
        const lastone = msg.atElem.atUserList![msg.atElem.atUserList!.length - 1];
        msg.atElem.atUserList?.map((u) => (atStr += u + " "));
        const idx = msg.atElem.text.indexOf(lastone);
        let atMsg = text.slice(idx + lastone.length)
        atMsg = parseEmojiFace(atMsg);
        return (
          <div style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
            <span>{`@${atStr}`}</span>
            <div style={{display:"inline-block"}} dangerouslySetInnerHTML={{__html:atMsg}}></div>
            {timeTip()}
          </div>
        );
      case messageTypes.PICTUREMESSAGE:
        return (
          <div className={`chat_bg_msg_content_pic ${!isSingle ? "nick_magin" : ""}`}>
            <Image
              placeholder={true}
              // width={200}
              height={200}
              src={msg.pictureElem.snapshotPicture.url ?? msg.pictureElem.sourcePicture.url}
              preview={{ visible: false }}
              onClick={() => imgClick(msg.pictureElem)}
            />
            {timeTip("pic_msg_time")}
          </div>
        );
      case messageTypes.VIDEOMESSAGE:
        return (
          <div className={`chat_bg_msg_content_video ${!isSingle ? "nick_magin" : ""}`}>
            <video controls width={200} src={msg.videoElem.videoUrl} />
            {timeTip("pic_msg_time")}
          </div>
        );
      case messageTypes.QUOTEMESSAGE:
        let quoteMsg = msg.quoteElem.text;
        quoteMsg = parseEmojiFace(quoteMsg);
        return (
          <div style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_qute ${!isSingle ? "nick_magin" : ""}`}>
            <div className="qute_content">
              <div>{`回复${msg.quoteElem.quoteMessage.senderNickName}:`}</div>
              <div className="content">{msg.quoteElem.quoteMessage.content}</div>
            </div>
            <div dangerouslySetInnerHTML={{__html:quoteMsg}}></div>
            {
              timeTip()
            }
          </div>
        );
      case messageTypes.MERGERMESSAGE:
        const merEl = msg.mergeElem;
        return (
          <div style={sty} onClick={() => merClick(merEl,msg.sendID)} className={`chat_bg_msg_content_text chat_bg_msg_content_mer ${!isSingle ? "nick_magin" : ""}`}>
            <div className="title">{merEl.title}</div>
            <div className="content">
              {merEl.abstractList?.map((m,idx) => (
                <div key={idx} className="item">{`${JSON.parse(m).name}: ${JSON.parse(m).content}`}</div>
              ))}
            </div>
            {timeTip()}
          </div>
        );
      case messageTypes.CARDMESSAGE:
        const ctx = JSON.parse(msg.content)
        return (
          <div onClick={()=>clickItem(ctx.uid)} style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_card ${!isSingle ? "nick_magin" : ""}`}>
            <div className="title">名片</div>
              <div className="desc">
                <MyAvatar src={ctx.icon} size={32}/>
                <div className="card_nick">{ctx.name}</div>
              </div>
              {timeTip()}
          </div>
        )
        default:
        return <div className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>[暂未支持的消息类型]</div>;
        // console.log(msg);
        break;
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const switchTip = () => {
    switch (msg.status) {
      case 1:
        return <Spin indicator={antIcon} />;
      case 2:
        if (curCve&&isSingleCve(curCve)) {
          return msg.isRead ? "已读" : "未读";
        }
        return null;
      case 3:
        return <ExclamationCircleFilled style={{ color: "#f34037", fontSize: "20px" }} />;
      default:
        break;
    }
  };

  const forwardMsg = () => {
    events.emit(FORWARDANDMERMSG,"forward",JSON.stringify(msg));
  };

  const mutilMsg = () => {
    events.emit(MUTILMSG, true);
  };

  const replayMsg = () => {
    events.emit(REPLAYMSG, msg);
  };

  const revMsg = () => {
    im.revokeMessage(JSON.stringify(msg))
      .then((res) => {
        events.emit(REVOKEMSG, msg.clientMsgID);
      })
      .catch((err) => message.error("撤回消息失败！"));
  };

  const delComfirm = () => {
    Modal.confirm({
      title: "删除信息",
      content: "确认删除该信息吗？",
      okButtonProps: {
        type: "primary",
      },
      okType: "danger",
      onOk: delMsg,
    });
  };

  const delMsg = () => {
    im.deleteMessageFromLocalStorage(JSON.stringify(msg))
      .then((res) => {
        events.emit(DELETEMESSAGE, msg.clientMsgID);
      })
      .catch((err) => message.error("删除消息失败！"));
  };

  const menus = [
    // {
    //   title: "翻译",
    //   icon: ts_msg,
    //   method: () => {},
    //   hidden: false,
    // },
    {
      title: "转发",
      icon: sh_msg,
      method: forwardMsg,
      hidden: false,
    },
    {
      title: "复制",
      icon: cp_msg,
      method: () => {},
      hidden: false,
    },
    {
      title: "多选",
      icon: mc_msg,
      method: mutilMsg,
      hidden: false,
    },
    {
      title: "回复",
      icon: re_msg,
      method: replayMsg,
      hidden: false,
    },
    {
      title: "撤回",
      icon: rev_msg,
      method: revMsg,
      hidden: false,
    },
    {
      title: "删除",
      icon: del_msg,
      method: delComfirm,
      hidden: false,
    },
  ];

  const switchMenu = (menu: typeof menus[0]) => {
    if (!canCpTypes.includes(msg.contentType) && canHiddenTypes.includes(menu.title)) {
      menu.hidden = true;
    }

    if (!isSelf(msg.sendID) && menu.title === "撤回") {
      menu.hidden = true;
    }
    return menu.hidden ? null : menu.title === "复制" ? (
      <CopyToClipboard key={menu.title} onCopy={() => message.success("复制成功！")} text={msg.content}>
        <div onClick={menu.method} className="msg_menu_iem">
          <img src={menu.icon} />
          <span>{menu.title}</span>
        </div>
      </CopyToClipboard>
    ) : (
      <div key={menu.title} onClick={menu.method} className="msg_menu_iem">
        <img src={menu.icon} />
        <span>{menu.title}</span>
      </div>
    );
  };

  const PopContent = () => {
    return <div onClick={()=>setContextMenuVisible(false)}>{menus.map((m) => switchMenu(m))}</div>;
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
    if (mutilSelect&&canCpTypes.includes(msg.contentType)) {
      events.emit(MUTILMSGCHANGE, !lastChange, msg);
      setLastChange((v) => !v);
    }
  };

  return (
    <div onClick={mutilCheckItem} className={`chat_bg_msg ${isSelf(msg.sendID) ? "chat_bg_omsg" : ""}`}>
      {mutilSelect && (
        <div style={switchStyle()} className="chat_bg_msg_check">
          <Checkbox disabled={!canCpTypes.includes(msg.contentType)} checked={lastChange} />
        </div>
      )}

      <div className="cs" onClick={() => clickItem(msg.sendID)}>
        <MyAvatar className="chat_bg_msg_icon" shape="square" size={42} src={msg.senderFaceUrl} />
      </div>

      <div className="chat_bg_msg_content">
        {(!curCve||!isSingleCve(curCve)) && <span className="nick">{msg.senderNickName}</span>}
        <Popover onVisibleChange={v=>setContextMenuVisible(v)} overlayClassName="msg_item_menu" key={msg.clientMsgID} content={PopContent} title={null} trigger="contextMenu" visible={contextMenuVisible}>
          {msgType(msg)}
        </Popover>
      </div>

      {isSelf(msg.sendID) ? (
        <div style={{ color: msg.isRead ? "#999" : "#428BE5", marginTop: (curCve&&isSingleCve(curCve)) ? "0" : "24px" }} className="chat_bg_flag">
          {switchTip()}
        </div>
      ) : null}
    </div>
  );
};

export default MsgItem;
