// import { OpenIMSDK } from 'open-im-sdk'
import { t } from "i18next";
import { Cve, Message } from "../@types/open_im";
import { messageTypes, SessionType, tipsTypes } from "../constants/messageContentType";
import { OpenIMSDK } from "./open_im_sdk";

export const im = new OpenIMSDK();

//utils
export const isSingleCve = (cve: Cve) => {
  return cve.userID !== "" && cve.groupID === "";
};

export const parseMessageType = (pmsg: Message, curUid?: string): string => {
  switch (pmsg.contentType) {
    case messageTypes.TEXTMESSAGE:
      return pmsg.content;
    case messageTypes.ATTEXTMESSAGE:
      return pmsg.atElem.text;
    case messageTypes.PICTUREMESSAGE:
      return t("PictureMessage");
    case messageTypes.VIDEOMESSAGE:
      return t("VideoMessage");
    case messageTypes.VOICEMESSAGE:
      return t("VoiceMessage");
    case messageTypes.LOCATIONMESSAGE:
      return t("LocationMessage");
    case messageTypes.CARDMESSAGE:
      return t("CardMessage");
    case messageTypes.MERGERMESSAGE:
      return t("MergeMessage");
    case messageTypes.FILEMESSAGE:
      return t("FileMessage");
    case messageTypes.REVOKEMESSAGE:
      return `${pmsg.sendID === curUid ? t("You") : pmsg.senderNickName} ${t("RevokeMessage")}`;
    case messageTypes.CUSTOMMESSAGE:
      return t("CustomMessage");
    case messageTypes.QUOTEMESSAGE:
      return t("QuoteMessage");
    case tipsTypes.ACCEPTFRIENDNOTICE:
      return t("AlreadyFriend");
    case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
      const jointip = JSON.parse(pmsg.content).defaultTips;
      const joinIdx = jointip.indexOf(" join the group");
      return jointip.slice(0, joinIdx) + " " + t("JoinedGroup");
    case tipsTypes.CREATEGROUPNOTICE:
      return t("AlreadyGroup");
    case tipsTypes.INVITETOGROUPNOTICE:
      const invitetip = JSON.parse(pmsg.content).defaultTips;
      const inviteIdx = invitetip.indexOf(" invited into the group chat by ");
      return invitetip.slice(32 + inviteIdx) + t("Invited") + invitetip.slice(0, inviteIdx) + t("IntoGroup");
    case tipsTypes.QUITGROUPNOTICE:
      const quitTip = JSON.parse(pmsg.content).defaultTips;
      const quitIdx = quitTip.indexOf(" have quit group chat");
      return quitTip.slice(6, quitIdx) + t("QuitedGroup");
    default:
      const tip = JSON.parse(pmsg.content);
      if (tip.isDisplay === 1) {
        return tip.defaultTips;
      } else {
        return "tips";
      }
  }
};

export const getNotification = (cb?: () => void) => {
  if (Notification.permission === "default" || Notification.permission === "denied") {
    Notification.requestPermission((permission) => {
      if (permission === "granted") {
        cb && cb();
      }
    });
  } else {
    cb && cb();
  }
};

export const createNotification = (message: Message, click?: (id: string, type: SessionType) => void, tag?: string) => {
  if (document.hidden) {
    const title = message.contentType === tipsTypes.ACCEPTFRIENDNOTICE ? t("FriendNotice") : message.senderNickName
    const notification = new Notification(title, {
      dir: "auto",
      tag: tag ?? (message.groupID === "" ? message.sendID : message.groupID),
      renotify: true,
      icon: message.senderFaceUrl,
      body: parseMessageType(message),
      requireInteraction: true,
    });
    const id = message.sessionType === SessionType.SINGLECVE ? (message.contentType === tipsTypes.ACCEPTFRIENDNOTICE ? message.recvID : message.sendID) : message.recvID
    notification.onclick = () => {
      click &&
        click(
          id,
          message.sessionType
        );
      notification.close();
    };
  }
};
