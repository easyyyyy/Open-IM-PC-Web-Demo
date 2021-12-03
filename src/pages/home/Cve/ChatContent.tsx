import { Image } from "antd";
import { FC, forwardRef, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { Cve, Message, PictureElem } from "../../../@types/open_im";
import { messageTypes, tipsTypes } from "../../../constants/messageContentType";
import { RootState } from "../../../store";
import { isSingleCve } from "../../../utils";
import ScrollView from "../../../components/ScrollView";
import { MyAvatar } from "../../../components/MyAvatar";

//@ts-ignore
const RefScrollView = forwardRef(ScrollView);

type MsgItemProps = {
  msg: Message;
  selfID: string;
  imgClick: (el: PictureElem) => void;
  curCve:Cve
};

const MsgItem: FC<MsgItemProps> = ({ msg, selfID, imgClick,curCve }) => {
  const isSelf = (sendID: string): boolean => {
    return selfID === sendID;
  };

  const msgType = (msg: Message) => {
    switch (msg.contentType) {
      case messageTypes.TEXTMESSAGE:
        return <div className="chat_bg_msg_text">{msg.content}</div>;
      case messageTypes.ATTEXTMESSAGE:
        let atStr = ''
        let text = msg.atElem.text
        const lastone = msg.atElem.atUserList![msg.atElem.atUserList!.length-1]
        msg.atElem.atUserList?.map(u=>atStr+=u+' ')
        const idx = msg.atElem.text.indexOf(lastone)
        return (
          <div className="chat_bg_msg_text"><span>{`@${atStr}`}</span>{text.slice(idx+lastone.length)}</div>
        )
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
        return <div className="chat_bg_msg_text">[暂未支持的消息类型]</div>;
        // console.log(msg);
        break;
    }
  };

  return (
    <div className={`chat_bg_msg ${isSelf(msg.sendID) ? "chat_bg_omsg" : ""}`}>
      <MyAvatar
        className="chat_bg_msg_icon"
        shape="square"
        size={42}
        src={msg.senderFaceUrl}
      />
      {msgType(msg)}
      {isSelf(msg.sendID)&&isSingleCve(curCve) ? (
        <div
          style={{ color: msg.isRead ? "#999" : "#428BE5" }}
          className="chat_bg_flag"
        >
          {msg.isRead ? "已读" : "未读"}
        </div>
      ) : null}
    </div>
  );
};

type ChatContentProps = {
  msgList: Message[];
  imgClick: (el: PictureElem) => void;
  loadMore: (uid?: string, gid?: string, sMsg?: any) => void;
  hasMore: boolean;
  curCve: Cve;
  loading: boolean;
};

const ChatContent: FC<ChatContentProps> = ({
  msgList,
  imgClick,
  loadMore,
  hasMore,
  curCve,
  loading,
}) => {
  const selectValue = (state: RootState) => state.user.selfInfo;
  const selfID = useSelector(selectValue, shallowEqual).uid!;
  const msgsRef = useRef(null);

  const tipList = Object.values(tipsTypes);

  const parseTip = (msg: Message): string => {
    if (msg.contentType === tipsTypes.REVOKEMESSAGE) {
      return `${
        msg.sendID === selfID ? "你" : msg.senderNickName
      }撤回了一条消息`;
    }
    switch (msg.contentType) {
      case tipsTypes.ACCEPTFRIENDNOTICE:
        return "你们已经是好友啦，开始聊天吧~"
      case tipsTypes.CREATEGROUPNOTICE:
        return "你已成功加入群聊"
      case tipsTypes.ACCEPTGROUPAPPLICATIONNOTICE:
        const jointip = JSON.parse(msg.content).defaultTips
        const joinIdx = jointip.indexOf(" join the group")
        return `${jointip.slice(0,joinIdx)} 加入了群聊`
      case tipsTypes.INVITETOGROUPNOTICE:
        const invitetip = JSON.parse(msg.content).defaultTips
        const inviteIdx = invitetip.indexOf(" invited into the group chat by ")
        return `${invitetip.slice(32+inviteIdx)}邀请了${invitetip.slice(0,6)}入群`
      case tipsTypes.QUITGROUPNOTICE:
        const quitTip = JSON.parse(msg.content).defaultTips
        const quitIdx = quitTip.indexOf(" have quit group chat")
        return `${quitTip.slice(6,quitIdx)} 退出了群聊`
      default:
        return JSON.parse(msg.content).defaultTips;
    }
      
  };

  const nextFuc = () => {
    console.log("nextFuc");
    // change tab update bug
    loadMore(curCve.userID, curCve.groupID, msgList[msgList.length - 1]);
  };

  return (
    <div className="chat_bg">
      {/* @ts-ignore */}
      <RefScrollView
        ref={msgsRef}
        // height={716}
        holdHeight={30}
        loading={loading}
        data={msgList}
        fetchMoreData={nextFuc}
        hasMore={hasMore}
      >
        {msgList?.map((msg) => {
          if (tipList.includes(msg.contentType)) {
            return (
              <div key={msg.clientMsgID} className="chat_bg_tips">
                {parseTip(msg)}
              </div>
            );
          } else {
            return (
              <MsgItem
                key={msg.clientMsgID}
                msg={msg}
                imgClick={imgClick}
                selfID={selfID}
                curCve={curCve}
              />
            );
          }
        })}
      </RefScrollView>
    </div>
  );

  // return (
  //   <div
  //     id="scrollableDiv"
  //     className="chat_bg"
  //   >
  //     {/*Put the scroll bar always on the bottom*/}
  //     <InfiniteScroll
  //       dataLength={msgList.length}
  //       next={nextFuc}
  //       style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
  //       inverse={true}
  //       scrollThreshold={0.9}
  //       hasMore={hasMore}
  //       loader={
  //         <Loading
  //           style={{ backgroundColor: "transparent" }}
  //           size={msgList.length === 0 ? "large" : "small"}
  //           height={msgList.length === 0 ? "716px" : "60px"}
  //         />
  //       }
  //       scrollableTarget="scrollableDiv"
  //       endMessage={<div className="chat_bg_nomore">没有更多啦~</div>}
  //     >
  //       {msgList?.map((msg) => {
  //         if (tipList.includes(msg.contentType)) {
  //           return (
  //             <div key={msg.clientMsgID} className="chat_bg_tips">
  //               {parseTip(msg.content)}
  //             </div>
  //           );
  //         } else {
  //           return (
  //             <MsgItem
  //               key={msg.clientMsgID}
  //               msg={msg}
  //               imgClick={imgClick}
  //               selfID={selfID}
  //             />
  //           );
  //         }
  //       })}
  //     </InfiniteScroll>
  //   </div>
  // );
};

export default ChatContent;
