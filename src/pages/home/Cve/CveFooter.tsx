import { CloseCircleFilled, CloseCircleOutlined, CloseOutlined, PlusCircleOutlined, SmileOutlined } from "@ant-design/icons";
import { Button, Dropdown, Image as AntdImage, Input, Layout, Menu, message, Tooltip, Upload } from "antd";
import { debounce, throttle } from "throttle-debounce";
import { FC, useEffect, useRef, useState } from "react";
import { cosUpload, events, im, isSingleCve } from "../../../utils";
import { Cve, FriendItem, Message, StringMapType } from "../../../@types/open_im";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { RcFile } from "antd/lib/upload";
import { PICMESSAGETHUMOPTION } from "../../../config";
import { messageTypes } from "../../../constants/messageContentType";
import { ATSTATEUPDATE, FORWARDANDMERMSG, ISSETDRAFT, MUTILMSG, MUTILMSGCHANGE, REPLAYMSG } from "../../../constants/events";
import CardMsgModal from "./components/CardMsgModal";
import { faceMap } from "../../../constants/faceType";

import send_id_card from "@/assets/images/send_id_card.png";
import send_pic from "@/assets/images/send_pic.png";
import send_video from "@/assets/images/send_video.png";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../../store";

const { Footer } = Layout;

type CveFooterProps = {
  sendMsg: (nMsg: string, type: messageTypes) => void;
  curCve: Cve;
};

type AtItem = {
  id: string;
  name: string;
};

const CveFooter: FC<CveFooterProps> = ({ sendMsg, curCve }) => {
  const inputRef = useRef<any>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [flag, setFlag] = useState(false);
  const [replyMsg, setReplyMsg] = useState<Message>();
  const [mutilSelect, setMutilSelect] = useState(false);
  const [crardSeVis, setCrardSeVis] = useState(false);
  const [mutilMsg, setMutilMsg] = useState<Message[]>([]);
  const [foceUpdate, setFoceUpdate] = useState(false);
  const [atList, setAtList] = useState<AtItem[]>([]);
  const [uid2name, setUid2name] = useState<StringMapType>({});
  const [face2str, setFace2str] = useState<StringMapType>({});
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);

  useEffect(() => {
    window.addEventListener("paste", textInit);

    events.on(REPLAYMSG, replyHandler);
    events.on(MUTILMSG, mutilHandler);
    return () => {
      window.removeEventListener("paste", textInit);
      events.off(REPLAYMSG, replyHandler);
      events.off(MUTILMSG, mutilHandler);
    };
  }, []);

  useEffect(() => {
    events.on(ATSTATEUPDATE, atHandler);
    events.on(ISSETDRAFT, setDraft);
    return () => {
      events.off(ATSTATEUPDATE, atHandler);
      events.off(ISSETDRAFT, setDraft);
    };
  }, [atList, uid2name, face2str]);

  useEffect(() => {
    events.on(MUTILMSGCHANGE, mutilMsgChangeHandler);
    return () => {
      events.off(MUTILMSGCHANGE, mutilMsgChangeHandler);
    };
  }, [mutilMsg]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (atList.length > 0) {
      setAtList([]);
    }

    if (curCve.draftText !== "") {
      parseDrft(curCve.draftText);
    } else {
      inputRef.current.innerHTML = "";
    }
  }, [curCve]);

  const textInit = (e: any) => {
    e.preventDefault();
    let text;
    const clp = (e.originalEvent || e).clipboardData;
    if (clp === undefined || clp === null) {
      text = "";
    } else {
      text = clp.getData("text/plain") || "";
    }
    // inputRef.current.innerHTML += text;
    document.execCommand("insertText", false, text);
    move2end();
  };

  const reParseEmojiFace = (text: string) => {
    faceMap.map((f) => {
      const idx = text.indexOf(f.context);
      if (idx > -1) {
        const faceStr = `<img alt="${f.context}" style="padding-right:2px" width="24px" src="${f.src}">`;
        setFace2str({ ...face2str, [faceStr]: f.context });
        text = text.replaceAll(f.context, faceStr);
      }
    });

    return text;
  };

  const reParseAt = (text: string) => {
    const pattern = /@\S+\s/g;
    const arr = text.match(pattern);
    console.log(arr);

    arr?.map((uid) => {
      const member = groupMemberList.find((gm) => gm.userId === uid.slice(1, -1));
      if (member) {
        text = text.replace(uid, `<b contenteditable="false" style="color:#428be5"> @${member.nickName}</b>&nbsp;`);

        setAtList([...atList, { id: member.userId, name: member.nickName }]);
        const hln = `<b contenteditable="false" style="color:#428be5"> @${member.nickName}</b>&nbsp;`;
        setUid2name({ ...uid2name, [hln]: member.userId });
      }
    });
    console.log(text);
    
    return text;
  };

  const parseDrft = (text: string) => {
    text = reParseEmojiFace(reParseAt(text));
    inputRef.current.innerHTML = text;
    move2end();
    setFoceUpdate((v) => !v);
  };

  const move2end = () => {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inputRef.current);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const atHandler = (id: string, name: string) => {
    if (replyMsg) {
      setReplyMsg(undefined);
    }
    if (atList.findIndex((au) => au.id === id) === -1) {
      setAtList([...atList, { id, name }]);

      const hln = `<b contenteditable="false" style="color:#428be5"> @${name}</b>&nbsp;`;

      setUid2name({ ...uid2name, [hln]: id });

      inputRef.current.innerHTML += hln;
      move2end();
      setFoceUpdate((v) => !v);
    }
  };

  const mutilHandler = (flag: boolean) => {
    setMutilSelect(flag);
  };

  const mutilMsgChangeHandler = (checked: boolean, msg: Message) => {
    let tms = [...mutilMsg];
    if (checked) {
      tms = [...tms, msg];
    } else {
      const idx = tms.findIndex((t) => t.clientMsgID === msg.clientMsgID);
      tms.splice(idx, 1);
    }
    setMutilMsg(tms);
  };

  const replyHandler = (msg: Message) => {
    console.log(msg);
    
    setReplyMsg(msg);
  };

  const setDraft = (cve: Cve) => {
    if ((inputRef.current && inputRef.current.innerHTML) || (cve.draftText !== "" && !inputRef.current.innerHTML)) {
      const option = {
        conversationID: cve.conversationID,
        draftText: atList.length > 0 ? parseEmojiFace(parseAt()) : parseEmojiFace(inputRef.current.innerHTML),
      };
      
      im.setConversationDraft(option)
        .then((res) => {})
        .catch((err) => {})
        .finally(() => (inputRef.current.innerHTML = ""));
    }
  };

  const getPicInfo = (file: RcFile): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const _URL = window.URL || window.webkitURL;
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.src = _URL.createObjectURL(file);
    });
  };

  const getVideoInfo = (file: RcFile): Promise<number> => {
    return new Promise((resolve, reject) => {
      const Url = URL.createObjectURL(file);
      const vel = new Audio(Url);
      vel.onloadedmetadata = function () {
        resolve(vel.duration);
      };
    });
  };

  const parseMsg = (msg: Message) => {
    switch (msg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return msg.content;
      case messageTypes.ATTEXTMESSAGE:
        return msg.atElem.text;
      case messageTypes.PICTUREMESSAGE:
        return "[图片消息]";
      case messageTypes.VIDEOMESSAGE:
        return "[视频消息]";
      case messageTypes.VOICEMESSAGE:
        return "[语音消息]";
      case messageTypes.LOCATIONMESSAGE:
        return "[位置消息]";
      case messageTypes.MERGERMESSAGE:
        return "[合并转发消息]";
      case messageTypes.FILEMESSAGE:
        return "[文件消息]";
      case messageTypes.QUOTEMESSAGE:
        return "[引用消息]";
      default:
        break;
    }
  };

  const sendCosMsg = async (uploadData: UploadRequestOption, type: string) => {
    cosUpload(uploadData)
      .then((res) => {
        if (type === "pic") {
          imgMsg(uploadData.file as RcFile, res.url);
        } else if (type === "video") {
          videoMsg(uploadData.file as RcFile, res.url);
        }
      })
      .catch((err) => message.error("上传失败！"));
  };

  const ChoseCard = () => {
    setCrardSeVis(true);
  };

  const imgMsg = async (file: RcFile, url: string) => {
    const { width, height } = await getPicInfo(file);
    const sourcePicture = {
      uuid: file.uid,
      type: file.type,
      size: file.size,
      width,
      height,
      url,
    };
    const snapshotPicture = {
      uuid: file.uid,
      type: file.type,
      size: file.size,
      width: 200,
      height: 200,
      url: url + PICMESSAGETHUMOPTION,
    };
    const imgInfo = {
      sourcePicture,
      snapshotPicture,
      bigPicture: sourcePicture,
    };
    const { data } = await im.createImageMessage(imgInfo);
    sendMsg(data, messageTypes.PICTUREMESSAGE);
  };

  const videoMsg = async (file: RcFile, url: string) => {
    const snp = "https://echat-1302656840.cos.ap-chengdu.myqcloud.com/rc-upload-1638518718431-15video_cover.png?imageView2/1/w/200/h/200/rq/80";
    const duration = await getVideoInfo(file);
    const videoInfo = {
      videoPath: url,
      duration,
      videoType: file.type,
      snapshotPath: snp,
      videoUUID: file.uid,
      videoUrl: url,
      videoSize: file.size,
      snapshotUUID: file.uid,
      snapshotSize: 117882,
      snapshotUrl: snp,
      snapshotWidth: 1024,
      snapshotHeight: 1024,
    };
    const { data } = await im.createVideoMessage(videoInfo);
    sendMsg(data, messageTypes.VIDEOMESSAGE);
  };

  const quoteMsg = async () => {
    const { data } = await im.createQuoteMessage({ text: parseEmojiFace(inputRef.current.innerHTML), message: JSON.stringify(replyMsg) });
    sendMsg(data, messageTypes.QUOTEMESSAGE);
    reSet();
  };

  const menus = [
    {
      title: "发送名片",
      icon: send_id_card,
      method: ChoseCard,
      type: "card",
    },
    {
      title: "发送视频",
      icon: send_video,
      method: sendCosMsg,
      type: "video",
    },
    {
      title: "发送图片",
      icon: send_pic,
      method: sendCosMsg,
      type: "pic",
    },
  ];

  const MsgType = () => (
    <Menu className="input_menu">
      {menus.map((m: any) => {
        if (m.type === "card") {
          return (
            <Menu.Item key={m.title} onClick={m.method} icon={<img src={m.icon} />}>
              {m.title}
            </Menu.Item>
          );
        } else {
          return (
            <Menu.Item key={m.title} icon={<img src={m.icon} />}>
              <Upload
                key={m.title}
                action={""}
                // beforeUpload={(data) => m.method(data, m.type)}
                customRequest={(data) => m.method(data, m.type)}
                showUploadList={false}
              >
                {m.title}
              </Upload>
            </Menu.Item>
          );
        }
      })}
    </Menu>
  );

  const faceClick = (face: typeof faceMap[0]) => {
    const faceEl = `<img alt="${face.context}" style="padding-right:2px" width="24px" src="${face.src}">`;
    setFace2str({ ...face2str, [faceEl]: face.context });
    inputRef.current.innerHTML += faceEl;
    setFoceUpdate((v) => !v);
  };

  const FaceType = () => (
    <div style={{ boxShadow: "0px 4px 25px rgb(0 0 0 / 16%)" }} className="face_container">
      {faceMap.map((face) => (
        <div key={face.context} onClick={() => faceClick(face)} className="face_item">
          <AntdImage preview={false} width={24} src={face.src} />
        </div>
      ))}
    </div>
  );

  const Suffix = () => (
    <div className="suffix_container">
      <Dropdown overlayClassName="face_type_drop" overlay={FaceType} placement="topLeft" arrow>
        {/* <Tooltip title="表情"> */}
        <SmileOutlined style={{ paddingRight: "8px" }} />
        {/* </Tooltip> */}
      </Dropdown>

      <Dropdown overlayClassName="msg_type_drop" overlay={MsgType} placement="topCenter" arrow>
        <PlusCircleOutlined />
      </Dropdown>
    </div>
  );

  const Prefix = () =>
    replyMsg ? (
      <div className="reply">
        <CloseCircleFilled onClick={() => setReplyMsg(undefined)} />
        <div className="reply_text">
          回复 <span>{replyMsg?.senderNickName}:</span> {parseMsg(replyMsg!)}
        </div>
      </div>
    ) : null;

  const switchMessage = (type: string) => {
    switch (type) {
      case "text":
        sendTextMsg();
        break;
      case "at":
        sendAtTextMsg();
        break;
      case "quote":
        quoteMsg();
        break;
      default:
        break;
    }
  };

  const reSet = () => {
    inputRef.current.innerHTML = "";
    setReplyMsg(undefined);
    setUid2name({});
    setAtList([]);
    setFlag(false);
  };

  const parseAt = () => {
    let text: string = inputRef.current.innerHTML;
    const tmpMaps = uid2name;
    Object.keys(tmpMaps).map((key: any) => {
      const idx = text.indexOf(key);
      if (idx > -1) {
        text = text.replace(key, ` @${tmpMaps[key]} `);
      }
    });
    return text.indexOf('<b contenteditable="false" style="color:#428be5"></b>') > -1 ? "" : text;
  };

  const parseEmojiFace = (text: string) => {
    const keys = Object.keys(face2str);

    if (keys.length > 0) {
      keys.map((key) => {
        text = text.replace(key, face2str[key]);
      });
    }
    return text;
  };

  const sendTextMsg = async () => {
    const { data } = await im.createTextMessage(parseEmojiFace(inputRef.current.innerHTML));
    sendMsg(data, messageTypes.TEXTMESSAGE);
    reSet();
  };

  const sendAtTextMsg = async () => {
    const options = {
      text: parseEmojiFace(parseAt()),
      atUserList: atList.map((au) => au.id),
    };

    const { data } = await im.createTextAtMessage(options);
    sendMsg(data, messageTypes.ATTEXTMESSAGE);
    reSet();
  };

  const typing = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      updateTypeing(curCve.userID, "yes");
    }, 2000);
  };

  const updateTypeing = (receiver: string, msgTip: string) => {
    im.typingStatusUpdate({ receiver, msgTip })
      .then((res) => {})
      .catch((err) => {});
  };

  const keyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    let lastValue: string = inputRef.current.innerHTML;

    const secIdx = lastValue.length;

    const lastIdx = lastValue.lastIndexOf("<b", secIdx);
    const rmStr = lastValue.slice(lastIdx, secIdx);
    const pattern = /^<b.*?&nbsp;$/;

    if (e.key === "Backspace" && lastIdx > -1 && pattern.test(rmStr)) {
      lastValue = lastValue.replace(new RegExp(rmStr), "");
      e.preventDefault();
      inputRef.current.innerHTML = lastValue;
      move2end();
      const rmName = rmStr.slice(26, -10);
      const tmpList = atList;
      const rmAtIdx = tmpList.findIndex((au) => au.name === rmName);
      tmpList.splice(rmAtIdx, 1);
      setAtList(tmpList);
      setFoceUpdate((v) => !v);
    }
    if (e.key === "Enter" && lastValue) {
      e.preventDefault();

      if (flag) return;
      setFlag(true);

      switchMessage(replyMsg ? "quote" : atList.length > 0 ? "at" : "text");
    }
  };

  // const keyDownDebounce = debounce(150,keyDown)

  const cancelMutil = () => {
    setMutilMsg([]);
    events.emit(MUTILMSG, false);
  };

  const selectRec = async () => {
    if (mutilMsg.length === 0) return;
    if (mutilMsg.length > 1) {
      message.info("当前仅支持转发一条文字消息~");
      return;
    }

    let tmm: string[] = [];
    mutilMsg.map((m) => {
      const obj = {
        name: m.senderNickName,
        content: parseMsg(m),
      };
      tmm.push(JSON.stringify(obj));
    });
    const options = {
      messageList: [...mutilMsg],
      title: isSingleCve(curCve) ? `与${curCve.showName}的聊天记录` : `群聊${curCve.showName}的聊天记录`,
      summaryList: tmm,
    };

    events.emit(FORWARDANDMERMSG, "merge", JSON.stringify(options));
  };

  const close = () => {
    setCrardSeVis(false);
  };

  const sendCardMsg = async (sf: FriendItem) => {
    const { data } = await im.createCardMessage(JSON.stringify(sf));
    sendMsg(data, messageTypes.CARDMESSAGE);
  };

  return (
    <Footer className="chat_footer">
      {mutilSelect ? (
        <div className="footer_mutil">
          <CloseOutlined onClick={cancelMutil} />
          <Button onClick={selectRec} type="primary" shape="round">
            合并转发
          </Button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ paddingTop: replyMsg ? "32px" : "4px" }} ref={inputRef} data-pl={`发送给 ${curCve.showName}`} onKeyDown={keyDown} className="input_div" contentEditable />
          <Prefix />
          <Suffix />
        </div>
      )}
      {crardSeVis && <CardMsgModal cb={sendCardMsg} visible={crardSeVis} close={close} />}
    </Footer>
  );
};

export default CveFooter;
