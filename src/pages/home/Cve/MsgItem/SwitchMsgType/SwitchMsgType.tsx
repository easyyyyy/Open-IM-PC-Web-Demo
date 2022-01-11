import { Tooltip, Image } from "antd";
import { useState, useRef, CSSProperties, useEffect, FC } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Map, Marker } from "react-amap";
import { Cve, MergeElem, Message, PictureElem } from "../../../../../@types/open_im";
import { MyAvatar } from "../../../../../components/MyAvatar";
import { MERMSGMODAL } from "../../../../../constants/events";
import { faceMap } from "../../../../../constants/faceType";
import { messageTypes } from "../../../../../constants/messageContentType";
import { RootState } from "../../../../../store";
import { formatDate, switchFileIcon, bytesToSize, events, isSingleCve } from "../../../../../utils";

import other_voice from "@/assets/images/voice_other.png";
import my_voice from "@/assets/images/voice_my.png";
import { useTranslation } from "react-i18next";

type SwitchMsgTypeProps = {
  msg: Message;
  audio: React.RefObject<HTMLAudioElement>;
  curCve: Cve;
  selfID: string;
  imgClick: (el: PictureElem) => void;
  clickItem: (uid: string) => void;
};

const SwitchMsgType: FC<SwitchMsgTypeProps> = ({ msg, audio, curCve, selfID, imgClick, clickItem }) => {
  const [isSingle, setIsSingle] = useState(false);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const textRef = useRef<HTMLDivElement>(null);
  const [sty, setSty] = useState<CSSProperties>({
    paddingRight: "40px",
  });
  const { t } = useTranslation();

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

  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const parseTime = (type: 0 | 1) => {
    const arr = formatDate(msg.sendTime / 1000000);
    return type ? arr[4] : arr[3] + " " + arr[4];
  };

  const merClick = (el: MergeElem, sender: string) => {
    events.emit(MERMSGMODAL, el, sender);
  };

  const timeTip = (className: string = "chat_bg_msg_content_time") => (
    <Tooltip overlayClassName="msg_time_tip" placement="bottom" title={parseTime(0)}>
      <div className={className}>{parseTime(1)}</div>
    </Tooltip>
  );

  const parseEmojiFace = (mstr: string) => {
    faceMap.map((f) => {
      const idx = mstr.indexOf(f.context);
      if (idx > -1) {
        mstr = mstr.replaceAll(f.context, `<img style="padding-right:2px" width="24px" src=${f.src} />`);
      }
    });
    return mstr;
  };

  const parseAt = (mstr: string) => {
    const pattern = /@\S+\s/g;
    const arr = mstr.match(pattern);

    arr?.map((a) => {
      const member = groupMemberList.find((gm) => gm.userId === a.slice(1, -1));
      if (member) {
        mstr = mstr.replace(a, `<span onclick="spanClick('${member.userId}')" style="color:#428be5;cursor: pointer;"> @${member.nickName} </span>`);
      } else {
        mstr = mstr.replace(a, `<span onclick="spanClick('${a.slice(1, -1)}')" style="color:#428be5;cursor: pointer;"> ${a}</span>`);
      }
    });
    return mstr;
  };

  const playVoice = (url: string) => {
    audio.current!.src = url;
    audio.current?.play();
  };

  const msgType = () => {
    switch (msg.contentType) {
      case messageTypes.TEXTMESSAGE:
        let mstr = msg.content;
        mstr = parseEmojiFace(mstr);
        return (
          <>
            <div ref={textRef} style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
              <div dangerouslySetInnerHTML={{ __html: mstr }}></div>
            </div>
            {timeTip()}
          </>
        );
      case messageTypes.ATTEXTMESSAGE:
        let atMsg = msg.atElem.text;
        atMsg = parseEmojiFace(atMsg);
        atMsg = parseAt(atMsg);
        return (
          <div style={sty} className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>
            <div style={{ display: "inline-block" }} dangerouslySetInnerHTML={{ __html: atMsg }}></div>
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
      case messageTypes.VOICEMESSAGE:
        const isSelfMsg = isSelf(msg.sendID);
        const imgStyle = isSelfMsg ? { paddingLeft: "4px" } : { paddingRight: "4px" };
        const imgSrc = isSelfMsg ? my_voice : other_voice;
        return (
          <div style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_voice ${!isSingle ? "nick_magin" : ""}`}>
            <div style={{ flexDirection: isSelfMsg ? "row-reverse" : "row" }} onClick={() => playVoice(msg.soundElem.sourceUrl)}>
              <img style={imgStyle} src={imgSrc} alt="" />
              {`${msg.soundElem.duration} ''`}
            </div>
            {timeTip()}
          </div>
        );
      case messageTypes.FILEMESSAGE:
        const fileEl = msg.fileElem;
        const suffix = fileEl.fileName.slice(fileEl.fileName.lastIndexOf(".") + 1);
        return (
          <div className={`chat_bg_msg_content_text chat_bg_msg_content_file ${!isSingle ? "nick_magin" : ""}`}>
            <div className="file_container">
              <img src={switchFileIcon(suffix)} alt="" />
              <div className="file_info">
                <div>{fileEl.fileName}</div>
                <div>{bytesToSize(fileEl.fileSize)}</div>
              </div>
            </div>
            {timeTip()}
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
        const quMsg = msg.quoteElem.quoteMessage;
        let replyMsg = msg.quoteElem.text;
        let quoteMsg = quMsg.contentType === messageTypes.ATTEXTMESSAGE ? parseAt(quMsg.atElem.text) : quMsg.content;
        replyMsg = parseEmojiFace(replyMsg);
        quoteMsg = parseEmojiFace(quoteMsg);
        return (
          <div style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_qute ${!isSingle ? "nick_magin" : ""}`}>
            <div className="qute_content">
              <div>{`${t("Reply")+msg.quoteElem.quoteMessage.senderNickName}:`}</div>
              <div className="content" dangerouslySetInnerHTML={{ __html: quoteMsg }}></div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: replyMsg }}></div>
            {timeTip()}
          </div>
        );
      case messageTypes.MERGERMESSAGE:
        const merEl = msg.mergeElem;
        return (
          <div style={sty} onClick={() => merClick(merEl, msg.sendID)} className={`chat_bg_msg_content_text chat_bg_msg_content_mer ${!isSingle ? "nick_magin" : ""}`}>
            <div className="title">{merEl.title}</div>
            <div className="content">
              {merEl.abstractList?.map((m, idx) => (
                <div key={idx} className="item">{`${JSON.parse(m).name}: ${JSON.parse(m).content}`}</div>
              ))}
            </div>
            {timeTip()}
          </div>
        );
      case messageTypes.CARDMESSAGE:
        const ctx = JSON.parse(msg.content);
        return (
          <div onClick={() => clickItem(ctx.uid)} style={sty} className={`chat_bg_msg_content_text chat_bg_msg_content_card ${!isSingle ? "nick_magin" : ""}`}>
            <div className="title">{t("IDCard")}</div>
            <div className="desc">
              <MyAvatar src={ctx.icon} size={32} />
              <div className="card_nick">{ctx.name}</div>
            </div>
            {timeTip()}
          </div>
        );
      case messageTypes.LOCATIONMESSAGE:
        const locationEl = msg.locationElem;
        const postion = { longitude: locationEl.longitude, latitude: locationEl.latitude };
        return (
          <div className={`chat_bg_msg_content_map ${!isSingle ? "nick_magin" : ""}`}>
            <Map protocol="https" center={postion} amapkey="dcdc861728801ee3410f67f6a487d3fa">
              <Marker position={postion} />
            </Map>
            {timeTip("pic_msg_time")}
          </div>
        );
      default:
        return <div className={`chat_bg_msg_content_text ${!isSingle ? "nick_magin" : ""}`}>{t("UnsupportedMessage")}</div>;
    }
  };

  return msgType();
};

export default SwitchMsgType;
