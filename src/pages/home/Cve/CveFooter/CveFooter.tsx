import { CloseCircleFilled, CloseOutlined } from "@ant-design/icons";
import { Button, Layout, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { events, im, isSingleCve } from "../../../../utils";
import { Cve, FriendItem, Message, StringMapType } from "../../../../@types/open_im";
import { messageTypes } from "../../../../constants/messageContentType";
import { ATSTATEUPDATE, FORWARDANDMERMSG, ISSETDRAFT, MUTILMSG, MUTILMSGCHANGE, REPLAYMSG } from "../../../../constants/events";
import CardMsgModal from "../components/CardMsgModal";
import { faceMap } from "../../../../constants/faceType";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../../../store";
import MsgTypeSuffix from "./MsgTypeSuffix";

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

    return text;
  };

  const parseDrft = (text: string) => {
    text = reParseEmojiFace(reParseAt(text));

    inputRef.current.innerHTML = text;
    console.log(inputRef.current.innerHTML);
    move2end();
    setFoceUpdate((v) => !v);
    console.log(inputRef.current.innerHTML);
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

  const quoteMsg = async () => {
    const { data } = await im.createQuoteMessage({ text: parseEmojiFace(inputRef.current.innerHTML), message: JSON.stringify(replyMsg) });
    sendMsg(data, messageTypes.QUOTEMESSAGE);
    reSet();
  };

  const ReplyPrefix = () =>
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

  const faceClick = (face: typeof faceMap[0]) => {
    const faceEl = `<img alt="${face.context}" style="padding-right:2px" width="24px" src="${face.src}">`;
    setFace2str({ ...face2str, [faceEl]: face.context });
    inputRef.current.innerHTML += faceEl;

    setFoceUpdate((v) => !v);
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
    im.typingStatusUpdate({ receiver, msgTip });
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
    typing();
  };

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

  const choseCard = () => {
    setCrardSeVis(true);
  };

  const MutilAction = () => (
    <div className="footer_mutil">
      <CloseOutlined onClick={cancelMutil} />
      <Button onClick={selectRec} type="primary" shape="round">
        合并转发
      </Button>
    </div>
  );

  return (
    <Footer className="chat_footer">
      {mutilSelect ? (
        <MutilAction />
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ paddingTop: replyMsg ? "32px" : "4px" }} ref={inputRef} data-pl={`发送给 ${curCve.showName}`} onKeyDown={keyDown} className="input_div" contentEditable />
          <ReplyPrefix />
          <MsgTypeSuffix choseCard={choseCard} faceClick={faceClick} sendMsg={sendMsg} />
        </div>
      )}
      {crardSeVis && <CardMsgModal cb={sendCardMsg} visible={crardSeVis} close={close} />}
    </Footer>
  );
};

export default CveFooter;
