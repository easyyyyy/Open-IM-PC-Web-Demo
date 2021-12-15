import { PlusCircleOutlined, SmileOutlined } from "@ant-design/icons";
import { Dropdown, Input, Layout, Menu, message, Tooltip, Upload } from "antd";
import { debounce, throttle } from "throttle-debounce";

import send_id_card from "@/assets/images/send_id_card.png";
import send_pic from "@/assets/images/send_pic.png";
import send_video from "@/assets/images/send_video.png";
import { FC, useEffect, useRef, useState } from "react";
import { cosUpload, events, im } from "../../../utils";
import { Cve } from "../../../@types/open_im";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { RcFile } from "antd/lib/upload";
import { PICMESSAGETHUMOPTION } from "../../../config";
import { messageTypes } from "../../../constants/messageContentType";
import { ISSETDRAFT } from "../../../constants/events";

const { Footer } = Layout;

type CveFooterProps = {
  sendMsg: (nMsg: string, type: messageTypes) => void;
  curCve: Cve;
};

const CveFooter: FC<CveFooterProps> = ({ sendMsg, curCve }) => {
  const inputRef = useRef<any>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    events.on(ISSETDRAFT, (cve: Cve) => {
      setDraft(cve);
    });
    return () => {
      events.off(ISSETDRAFT, () => {});
    };
  }, []);

  const setDraft = (cve: Cve) => {
    if (inputRef.current.state.value || (cve.draftText !== "" && !inputRef.current.state.value)) {
      console.log("set");
      
      im.setConversationDraft({ conversationID: cve.conversationID, draftText: inputRef.current.state.value??"" })
        .then((res) => {})
        .catch((err) => {})
        .finally(()=>inputRef.current.state.value="")
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

  const getFileFromBase64 = (base64URL: string, filename: string) => {
    var arr = base64URL.split(","),
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: "image/png" });
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

  // const getVideoInfo = (file: RcFile): Promise<Array<any>> => {
  //   return new Promise((resolve, reject) => {
  //     const Url = URL.createObjectURL(file);
  //     const vel = document.createElement("video");
  //     vel.style.display = "none";
  //     vel.src = Url;
  //     vel.onloadedmetadata = function (e) {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = vel.videoWidth * 0.8;
  //       canvas.height = vel.videoHeight * 0.8;
  //       canvas
  //         .getContext("2d")
  //         ?.drawImage(vel, 0, 0, canvas.width, canvas.height);
  //       const imgfile = getFileFromBase64(
  //         canvas.toDataURL("image/png"),
  //         file.uid + ".png"
  //       );
  //       thumUpload(imgfile)
  //         .then((res) => {
  //           console.log(res);
  //           resolve([vel.duration, res.url]);
  //         })
  //         .catch((err) => console.log(err));
  //     };
  //   });
  // };

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

  const menus = [
    {
      title: "发送名片",
      icon: send_id_card,
      method: () => {},
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

  const switchMessage = (type: string) => {
    switch (type) {
      case "text":
        sendTextMsg();
        break;

      default:
        break;
    }
  };

  const sendTextMsg = async () => {
    const { data } = await im.createTextMessage(inputRef.current.state.value);
    sendMsg(data, messageTypes.TEXTMESSAGE);
    inputRef.current.state.value = ""
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
      switchMessage("text");
    }
  };

  // const keyDownDebounce = debounce(150,keyDown)

  return (
    <Footer className="chat_footer">
      <Input
        ref={inputRef}
        // value={inputRef?.current.value}
        onKeyDown={keyDown}
        onChange={(e) => {
          typing();
        }}
        placeholder={`发送给 ${curCve.showName}`}
        suffix={suffix}
      />
    </Footer>
  );
};

export default CveFooter;
