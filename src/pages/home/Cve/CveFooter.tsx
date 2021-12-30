import { CloseCircleFilled, CloseCircleOutlined, CloseOutlined, PlusCircleOutlined, SmileOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Layout, Menu, message, Tooltip, Upload } from "antd";
import { debounce, throttle } from "throttle-debounce";

import send_id_card from "@/assets/images/send_id_card.png";
import send_pic from "@/assets/images/send_pic.png";
import send_video from "@/assets/images/send_video.png";
import { FC, useEffect, useRef, useState } from "react";
import { cosUpload, events, im, isSingleCve } from "../../../utils";
import { Cve, FriendItem, Message } from "../../../@types/open_im";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { RcFile } from "antd/lib/upload";
import { PICMESSAGETHUMOPTION } from "../../../config";
import { messageTypes } from "../../../constants/messageContentType";
import { FORWARDANDMERMSG, ISSETDRAFT, MUTILMSG, MUTILMSGCHANGE, REPLAYMSG } from "../../../constants/events";
import CardMsgModal from "./components/CardMsgModal";

const { Footer } = Layout;

type CveFooterProps = {
  sendMsg: (nMsg: string, type: messageTypes) => void;
  curCve: Cve;
};

const CveFooter: FC<CveFooterProps> = ({ sendMsg, curCve }) => {
  const inputRef = useRef<any>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [flag, setFlag] = useState(false);
  const [replyMsg, setReplyMsg] = useState<Message>();
  const [mutilSelect, setMutilSelect] = useState(false);
  const [crardSeVis,setCrardSeVis] = useState(false);
  const [mutilMsg, setMutilMsg] = useState<Message[]>([]);

  useEffect(() => {
    events.on(REPLAYMSG, replyHandler);
    events.on(MUTILMSG, mutilHandler);

    return () => {
      events.off(REPLAYMSG, replyHandler);
      events.off(MUTILMSG, mutilHandler);
    };
  }, []);

  useEffect(() => {
    events.on(MUTILMSGCHANGE, mutilMsgChangeHandler);
    return () => {
      events.off(MUTILMSGCHANGE, mutilMsgChangeHandler);
    };
  }, [mutilMsg]);

  useEffect(() => {
    if (!inputRef.current) return;

    if (curCve.draftText !== "") {
      inputRef.current.state.value = curCve.draftText;
    } else {
      inputRef.current.state.value = "";
    }
  }, [curCve]);

  useEffect(() => {
    events.on(ISSETDRAFT, setDraft);
    return () => {
      events.off(ISSETDRAFT, setDraft);
    };
  }, []);

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
    console.log(tms);
    setMutilMsg(tms);
  };

  const replyHandler = (msg: Message) => {
    setReplyMsg(msg);
  };

  const setDraft = (cve: Cve) => {
    if ((inputRef.current && inputRef.current.state.value) || (cve.draftText !== "" && !inputRef.current.state.value)) {
      im.setConversationDraft({ conversationID: cve.conversationID, draftText: inputRef.current.state.value ?? "" })
        .then((res) => {})
        .catch((err) => {})
        .finally(() => (inputRef.current.state.value = ""));
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
        return `${msg.senderNickName + " " + msg.atElem.text}`;
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
    console.log(uploadData);
    cosUpload(uploadData)
      .then((res) => {
        console.log(res);
        if (type === "pic") {
          imgMsg(uploadData.file as RcFile, res.url);
        } else if (type === "video") {
          videoMsg(uploadData.file as RcFile, res.url);
        }
      })
      .catch((err) => message.error("上传失败！"));
  };

  const ChoseCard = () => {
    setCrardSeVis(true)
  }

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
    const { data } = await im.createQuoteMessage({ text: inputRef.current.state.value, message: JSON.stringify(replyMsg) });
    sendMsg(data, messageTypes.QUOTEMESSAGE);
    inputRef.current.state.value = "";
    setFlag(false);
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

  const menu = (
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

  const suffix = (
    <>
      <Tooltip title="表情">
        <SmileOutlined style={{ paddingRight: "8px" }} />
      </Tooltip>
      <Dropdown overlayClassName="drop_box" overlay={menu} placement="topCenter" arrow>
        <PlusCircleOutlined />
      </Dropdown>
    </>
  );

  const prefix = () => (
    <div className="reply">
      <CloseCircleFilled onClick={() => setReplyMsg(undefined)} />
      <div className="reply_text">
        回复 <span>{replyMsg?.senderNickName}:</span> {parseMsg(replyMsg!)}
      </div>
    </div>
  );

  const switchMessage = (type: string) => {
    switch (type) {
      case "text":
        sendTextMsg();
        break;
      case "quote":
        quoteMsg();
        break;
      default:
        break;
    }
  };

  const sendTextMsg = async () => {
    const { data } = await im.createTextMessage(inputRef.current.state.value);
    sendMsg(data, messageTypes.TEXTMESSAGE);
    inputRef.current.state.value = "";
    setReplyMsg(undefined)
    setFlag(false);
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
    if (e.key === "Enter" && inputRef.current.state.value) {
      if (flag) return;
      setFlag(true);
      switchMessage(replyMsg?"quote":"text");
    }
  };

  // const keyDownDebounce = debounce(150,keyDown)

  const cancelMutil = () => {
    setMutilMsg([]);
    events.emit(MUTILMSG, false);
  };

  const selectRec = async () => {
    if (mutilMsg.length === 0) return;
    if(mutilMsg.length>1){
      message.info("当前仅支持转发一条文字消息~")
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
    setCrardSeVis(false)
  }

  const sendCardMsg = async (sf:FriendItem) => {
    const { data } = await im.createCardMessage(JSON.stringify(sf))
    sendMsg(data,messageTypes.CARDMESSAGE);
  }

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
        <Input
          style={{
            paddingTop: replyMsg ? "32px" : "4px",
          }}
          prefix={replyMsg ? prefix() : null}
          ref={inputRef}
          // value={inputRef?.current.value}
          onKeyDown={keyDown}
          onChange={(e) => {
            typing();
          }}
          placeholder={`发送给 ${curCve.showName}`}
          suffix={suffix}
        />
      )}
      {
        crardSeVis&&<CardMsgModal cb={sendCardMsg} visible={crardSeVis} close={close}/>
      }
    </Footer>
  );
};

export default CveFooter;
