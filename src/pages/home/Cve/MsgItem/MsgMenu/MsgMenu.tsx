import { message, Modal, Popover } from "antd";
import { FC } from "react";

import ts_msg from "@/assets/images/ts_msg.png";
import re_msg from "@/assets/images/re_msg.png";
import rev_msg from "@/assets/images/rev_msg.png";
import mc_msg from "@/assets/images/mc_msg.png";
import sh_msg from "@/assets/images/sh_msg.png";
import del_msg from "@/assets/images/del_msg.png";
import cp_msg from "@/assets/images/cp_msg.png";
import { events, im } from "../../../../../utils";
import CopyToClipboard from "react-copy-to-clipboard";
import { FORWARDANDMERMSG, MUTILMSG, REPLAYMSG, REVOKEMSG, DELETEMESSAGE } from "../../../../../constants/events";
import { messageTypes } from "../../../../../constants/messageContentType";
import { Message } from "../../../../../@types/open_im";

const canCpTypes = [messageTypes.TEXTMESSAGE, messageTypes.ATTEXTMESSAGE];
const canHiddenTypes = ["复制", "翻译", "回复", "转发"];

type MsgMenuProps = {
  visible: boolean;
  msg: Message;
  isSelf: boolean;
  visibleChange: (v: boolean) => void;
};

const MsgMenu: FC<MsgMenuProps> = ({ visible, msg, isSelf, visibleChange, children }) => {
  const forwardMsg = () => {
    events.emit(FORWARDANDMERMSG, "forward", JSON.stringify(msg));
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

    if (!isSelf && menu.title === "撤回") {
      menu.hidden = true;
    }
    return menu.hidden ? null : menu.title === "复制" ? (
      <CopyToClipboard key={menu.title} onCopy={() => message.success("复制成功！")} text={msg.contentType === messageTypes.ATTEXTMESSAGE ? msg.atElem.text : msg.content}>
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
    return <div onClick={() => visibleChange(false)}>{menus.map((m) => switchMenu(m))}</div>;
  };

  return (
    <Popover onVisibleChange={(v) => visibleChange(v)} overlayClassName="msg_item_menu" content={PopContent} title={null} trigger="contextMenu" visible={visible}>
      <div>{children}</div>
    </Popover>
  );
};

export default MsgMenu;
