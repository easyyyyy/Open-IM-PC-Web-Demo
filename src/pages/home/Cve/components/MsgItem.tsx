import { LoadingOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Spin, Popover,Image } from "antd";
import { FC } from "react";
import { Message, PictureElem, Cve } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { messageTypes } from "../../../../constants/messageContentType";
import { isSingleCve } from "../../../../utils";

import ts_msg from "@/assets/images/ts_msg.png";
import re_msg from "@/assets/images/re_msg.png";
import rev_msg from "@/assets/images/rev_msg.png";
import mc_msg from "@/assets/images/mc_msg.png";
import sh_msg from "@/assets/images/sh_msg.png";
import del_msg from "@/assets/images/del_msg.png";
import cp_msg from "@/assets/images/cp_msg.png";

type MsgItemProps = {
  msg: Message;
  selfID: string;
  imgClick: (el: PictureElem) => void;
  clickItem: (uid: string) => void;
  curCve: Cve;
};

const MsgItem: FC<MsgItemProps> = ({
  msg,
  selfID,
  imgClick,
  curCve,
  clickItem,
}) => {
  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const msgType = (msg: Message) => {
    switch (msg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return <div className="chat_bg_msg_content_text">{msg.content}</div>;
      case messageTypes.ATTEXTMESSAGE:
        let atStr = "";
        let text = msg.atElem.text;
        const lastone =
          msg.atElem.atUserList![msg.atElem.atUserList!.length - 1];
        msg.atElem.atUserList?.map((u) => (atStr += u + " "));
        const idx = msg.atElem.text.indexOf(lastone);
        return (
          <div className="chat_bg_msg_content_text">
            <span>{`@${atStr}`}</span>
            {text.slice(idx + lastone.length)}
          </div>
        );
      case messageTypes.PICTUREMESSAGE:
        return (
          <div>
            <Image
              placeholder={true}
              width={200}
              src={
                msg.pictureElem.snapshotPicture.url ??
                msg.pictureElem.sourcePicture.url
              }
              preview={{ visible: false }}
              onClick={() => imgClick(msg.pictureElem)}
            />
          </div>
        );
      case messageTypes.VIDEOMESSAGE:
        return (
          <div>
            <video controls width={200} src={msg.videoElem.videoUrl} />
          </div>
        );
      default:
        return (
          <div className="chat_bg_msg_content_text">[暂未支持的消息类型]</div>
        );
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
        if (isSingleCve(curCve)) {
          return msg.isRead ? "已读" : "未读";
        }
        return null;
      case 3:
        return (
          <ExclamationCircleFilled
            style={{ color: "#f34037", fontSize: "20px" }}
          />
        );
      default:
        break;
    }
  };

  const forwordMsg = () => {};

  const cpMsg = () => {};

  const mutilMsg = () => {};

  const replayMsg = () => {};

  const revMsg = () => {};

  const delMsg = () => {
    // im.deleteMessageFromLocalStorage(JSON.stringify(msg)).then(res=>{
    //   events.emit(DELETEMESSAGE,msg.clientMsgID)
    //   message.success("消息删除成功！")
    // }).catch(err=>message.error("删除消息失败！"))
  };

  const menus = [
    {
      title: "翻译",
      icon: ts_msg,
      method: () => {},
      hidden: false,
    },
    {
      title: "转发",
      icon: sh_msg,
      method: forwordMsg,
      hidden: false,
    },
    {
      title: "复制",
      icon: cp_msg,
      method: cpMsg,
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
      method: delMsg,
      hidden: false,
    },
  ];

  const switchMenu = (menu: typeof menus[0]) => {
    const canCpTypes = [messageTypes.TEXTMESSAGE, messageTypes.ATTEXTMESSAGE];
    const canHiddenTypes = ["复制", "翻译"];
    if (
      !canCpTypes.includes(msg.contentType) &&
      canHiddenTypes.includes(menu.title)
    ) {
      menu.hidden = true;
    }
    if (!isSelf(msg.sendID) && menu.title === "撤回") {
      menu.hidden = true;
    }
    return menu.hidden ? null : (
      <div key={menu.title} onClick={menu.method} className="msg_menu_iem">
        <img src={menu.icon} />
        <span>{menu.title}</span>
      </div>
    );
  };

  const PopContent = () => {
    return <div>{menus.map((m) => switchMenu(m))}</div>;
  };

  return (
    <div className={`chat_bg_msg ${isSelf(msg.sendID) ? "chat_bg_omsg" : ""}`}>
      <div className="cs" onClick={() => clickItem(msg.sendID)}>
        <MyAvatar
          className="chat_bg_msg_icon"
          shape="square"
          size={42}
          src={msg.senderFaceUrl}
        />
      </div>

      <div className="chat_bg_msg_content">
        <Popover
          overlayClassName="msg_item_menu"
          key={msg.clientMsgID}
          content={PopContent}
          title={null}
          trigger="contextMenu"
          // visible={true}
        >
          {msgType(msg)}
        </Popover>
      </div>

      {isSelf(msg.sendID) ? (
        <div
          style={{ color: msg.isRead ? "#999" : "#428BE5" }}
          className="chat_bg_flag"
        >
          {switchTip()}
        </div>
      ) : null}
    </div>
  );
};

export default MsgItem;
