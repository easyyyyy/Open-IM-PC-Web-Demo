import { Button, Image, Layout, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Cve, FriendItem, GroupItem, GroupMember, MergeElem, Message, PictureElem } from "../../../@types/open_im";
import { RootState } from "../../../store";
import CveList from "./CveList";
import CveFooter from "./CveFooter";
import CveRightBar from "./CveRightBar";
import HomeSider from "../components/HomeSider";
import HomeHeader from "../components/HomeHeader";
import { events, im, isSingleCve } from "../../../utils";
import ChatContent from "./ChatContent";
import home_bg from "@/assets/images/home_bg.png";
import { messageTypes, notOssMessageTypes, sessionType, tipsTypes } from "../../../constants/messageContentType";
import { useReactive, useRequest } from "ahooks";
import { CbEvents } from "../../../utils/src";
import { DELETEMESSAGE, ISSETDRAFT, MERMSGMODAL, OPENGROUPMODAL, RESETCVE, REVOKEMSG, SENDFORWARDMSG, TOASSIGNCVE, UPDATEFRIENDCARD } from "../../../constants/events";
import { scroller, animateScroll } from "react-scroll";
import { MergerMsgParams, WsResponse } from "../../../utils/src/im";
import MerModal from "./components/MerModal";
import { SelectType } from "../components/InviteMemberBox";

const { Content } = Layout;

type NMsgMap = {
  oid: string;
  mid: string;
  flag: boolean;
};

const WelcomeContent = () => {
  const createGroup = () => {
    events.emit(OPENGROUPMODAL, "create");
  };
  return (
    <div className="content_bg">
      <div className="content_bg_title">创建群组</div>
      <div className="content_bg_sub">创建群组，立即开启在线办公</div>
      <img src={home_bg} alt="" />
      <Button onClick={createGroup} className="content_bg_btn" type="primary">
        立即创建
      </Button>
    </div>
  );
};

type ReactiveState = {
  historyMsgList: Message[];
  groupMemberList: GroupMember[];
  friendInfo: FriendItem;
  curCve: Cve | null;
  typing: boolean;
  hasMore: boolean;
  loading: boolean;
  merModal: boolean;
  merData: (MergeElem & { sender: string }) | undefined;
  searchStatus: boolean;
  searchCve: Cve[];
};

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [imgGroup, setImgGroup] = useState<Array<string>>([]);
  const selectCveList = (state: RootState) => state.cve.cves;
  const cveList = useSelector(selectCveList, shallowEqual);
  const selectCveLoading = (state: RootState) => state.cve.cveInitLoading;
  const cveLoading = useSelector(selectCveLoading, shallowEqual);
  const selfID = useSelector((state: RootState) => state.user.selfInfo.uid);
  const rs = useReactive<ReactiveState>({
    historyMsgList: [],
    groupMemberList: [],
    friendInfo: {} as FriendItem,
    curCve: null,
    typing: false,
    hasMore: true,
    loading: false,
    merModal: false,
    merData: undefined,
    searchStatus: false,
    searchCve: [],
  });
  const timer = useRef<NodeJS.Timeout | null>(null);
  const {
    loading,
    run: getMsg,
    cancel: msgCancel,
  } = useRequest(im.getHistoryMessageList, {
    manual: true,
    onSuccess: handleMsg,
    onError: (err) => message.error("获取聊天记录失败！"),
  });

  let nMsgMaps: NMsgMap[] = [];

  useEffect(() => {
    im.on(CbEvents.ONRECVNEWMESSAGE, newMsgHandler);

    im.on(CbEvents.ONRECVMESSAGEREVOKED, revokeMsgHandler);

    im.on(CbEvents.ONRECVC2CREADRECEIPT, c2cMsgHandler);

    im.on(CbEvents.ONMEMBERINVITED, memberInviteHandler);

    im.on(CbEvents.ONMEMBERKICKED, memberKickHandler);

    im.on(CbEvents.ONMEMBERENTER, (data) => {
      console.log(JSON.parse(data.data));
    });

    im.on(CbEvents.ONMEMBERLEAVE, (data) => {
      console.log(JSON.parse(data.data));
    });

    return () => {
      im.off(CbEvents.ONRECVNEWMESSAGE, newMsgHandler);
      im.off(CbEvents.ONRECVMESSAGEREVOKED, revokeMsgHandler);
      im.off(CbEvents.ONRECVC2CREADRECEIPT, c2cMsgHandler);
      im.off(CbEvents.ONMEMBERINVITED, memberInviteHandler);
      im.off(CbEvents.ONMEMBERKICKED, memberKickHandler);
    };
  }, []);

  useEffect(() => {
    events.on(UPDATEFRIENDCARD, updateCardHandler);
    events.on(TOASSIGNCVE, assignHandler);
    events.on(RESETCVE, resetCve);
    events.on(DELETEMESSAGE, deleteMsg);
    events.on(REVOKEMSG, revokeMyMsgHandler);
    events.on(MERMSGMODAL, merModalHandler);
    events.on(SENDFORWARDMSG, sendForwardHandler);
    return () => {
      events.off(UPDATEFRIENDCARD, updateCardHandler);
      events.off(TOASSIGNCVE, assignHandler);
      events.off(RESETCVE, resetCve);
      events.off(DELETEMESSAGE, deleteMsg);
      events.off(REVOKEMSG, revokeMyMsgHandler);
      events.off(MERMSGMODAL, merModalHandler);
      events.off(SENDFORWARDMSG, sendForwardHandler);
    };
  }, []);

  //  event hander
  const updateCardHandler = (id: string) => {
    getFriendInfo(id);
  };

  const merModalHandler = (el: MergeElem, sender: string) => {
    rs.merData = { ...el, sender };
    rs.merModal = true;
  };

  const assignHandler = (id: string, type: sessionType) => {
    getOneCve(id, type)
      .then((cve) => clickItem(cve))
      .catch((err) => message.error("获取会话失败！"));
  };

  const sendForwardHandler = (options: string | MergerMsgParams, type: messageTypes, list: SelectType[]) => {
    list.map(async (s) => {
      const uid = (s as FriendItem).uid;
      const gid = (s as GroupItem).groupID;
      let data;
      if (type === messageTypes.MERGERMESSAGE) {
        data = await im.createMergerMessage(options as MergerMsgParams);
      } else {
        data = await im.createForwardMessage(options as string);
      }
      sendMsg(data.data, type, uid, gid);
    });
  };

  //  im hander
  const newMsgHandler = (data: WsResponse) => {
    if (rs.curCve) {
      const newServerMsg: Message = JSON.parse(data.data);
      if (inCurCve(newServerMsg)) {
        if (newServerMsg.contentType === messageTypes.TYPINGMESSAGE) {
          typingUpdate();
        } else {
          rs.historyMsgList = [newServerMsg, ...rs.historyMsgList];
          // scrollToBottom()

          if (isSingleCve(rs.curCve)) {
            markC2CHasRead(rs.curCve.userID, [newServerMsg.clientMsgID]);
          }

          markCveHasRead(rs.curCve, 1);
        }
      }
    }
  };

  const revokeMsgHandler = (data: WsResponse) => {
    const idx = rs.historyMsgList.findIndex((m) => m.clientMsgID === data.data);
    if (idx > -1) {
      rs.historyMsgList.splice(idx, 1);
    }
  };

  const c2cMsgHandler = (data: WsResponse) => {
    JSON.parse(data.data).map((cr: any) => {
      cr.msgIDList.map((crt: string) => {
        rs.historyMsgList.find((hism) => {
          if (hism.clientMsgID === crt) {
            hism.isRead = true;
          }
        });
      });
    });
  };

  const memberInviteHandler = (data: WsResponse) => {
    rs.groupMemberList = [...rs.groupMemberList, ...JSON.parse(JSON.parse(data.data).memberList)];
  };

  const memberKickHandler = (data: WsResponse) => {
    let idxs: number[] = [];
    const users: GroupMember[] = JSON.parse(JSON.parse(data.data).memberList);
    users.map((u) => {
      rs.groupMemberList.map((gm, idx) => {
        if (u.userId === gm.userId) {
          idxs.push(idx);
        }
      });
    });
    idxs.map((i) => rs.groupMemberList.splice(i, 1));
  };

  const inCurCve = (newServerMsg: Message): boolean => {
    return (
      (newServerMsg.sendID === rs.curCve?.userID && newServerMsg.recvID === selfID) ||
      newServerMsg.recvID === rs.curCve?.groupID ||
      (newServerMsg.sendID === selfID && newServerMsg.recvID === rs.curCve?.userID)
    );
  };

  const resetCve = () => {
    rs.curCve = null;
  };

  const deleteMsg = (mid: string) => {
    const idx = rs.historyMsgList.findIndex((h) => h.clientMsgID === mid);
    let tmpList = [...rs.historyMsgList];
    tmpList.splice(idx, 1);
    rs.historyMsgList = tmpList;
    message.success("消息删除成功！");
  };

  const revokeMyMsgHandler = (mid: string) => {
    const idx = rs.historyMsgList.findIndex((h) => h.clientMsgID === mid);
    rs.historyMsgList[idx].contentType = tipsTypes.REVOKEMESSAGE;
  };

  const typingUpdate = () => {
    rs.typing = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      rs.typing = false;
    }, 1000);
  };

  const clickItem = (cve: Cve) => {
    if (cve.conversationID === rs.curCve?.conversationID) return;

    if (rs.curCve) {
      events.emit(ISSETDRAFT, rs.curCve);
    }
    rs.historyMsgList.length = 0;
    rs.curCve = cve;
    rs.hasMore = true;
    msgCancel();
    setImgGroup([]);
    getHistoryMsg(cve.userID, cve.groupID);
    markCveHasRead(cve);
    if (!isSingleCve(cve)) {
      getGroupMembers(cve.groupID);
    } else {
      getFriendInfo(cve.userID);
    }
  };

  const markCveHasRead = (cve: Cve, type?: number) => {
    if (cve.unreadCount === 0 && !type) return;

    if (isSingleCve(cve)) {
      im.markSingleMessageHasRead(cve.userID)
        .then((res) => {})
        .catch((err) => {});
    } else {
      im.markGroupMessageHasRead(cve.groupID)
        .then((res) => {})
        .catch((err) => {});
    }
  };

  const getOneCve = (sourceID: string, sessionType: number): Promise<Cve> => {
    return new Promise((resolve, reject) => {
      im.getOneConversation({ sourceID, sessionType })
        .then((res) => {
          resolve(JSON.parse(res.data));
        })
        .catch((err) => reject(err));
    });
  };

  const getGroupMembers = (gid: string) => {
    const options = {
      groupId: gid,
      next: 0,
      filter: 0,
    };
    im.getGroupMemberList(options).then((res) => {
      rs.groupMemberList = JSON.parse(res.data).data;
    });
  };

  const getFriendInfo = (fid: string) => {
    im.getFriendsInfo([fid]).then((res) => {
      rs.friendInfo = JSON.parse(res.data)[0];
    });
  };

  const markC2CHasRead = (receiver: string, msgIDList: string[]) => {
    if (msgIDList.length === 0) return;
    im.markC2CMessageAsRead({ receiver, msgIDList })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const getHistoryMsg = (uid?: string, gid?: string, sMsg?: Message) => {
    rs.loading = true;

    const config = {
      userID: uid ?? "",
      groupID: gid ?? "",
      count: 20,
      startMsg: sMsg ?? null,
    };

    getMsg(config);
  };

  function handleMsg(res: WsResponse) {
    if (JSON.parse(res.data).length === 0) {
      rs.hasMore = false;
      return;
    }
    if (JSON.stringify(rs.historyMsgList[rs.historyMsgList.length - 1]) == JSON.stringify(JSON.parse(res.data).reverse()[0])) {
      rs.historyMsgList.pop();
    }

    if (isSingleCve(rs.curCve!)) {
      let unReads: string[] = [];
      (JSON.parse(res.data) as Message[]).map((m) => {
        if (!m.isRead && m.recvID === selfID) {
          unReads.push(m.clientMsgID);
        }
      });
      markC2CHasRead(rs.curCve?.userID!, unReads);
    }

    rs.historyMsgList = [...rs.historyMsgList, ...JSON.parse(res.data).reverse()];
    console.log(rs.historyMsgList);

    if (JSON.parse(res.data).length < 20) {
      rs.hasMore = false;
    } else {
      rs.hasMore = true;
    }
    rs.loading = false;
  }

  const imgClick = (el: PictureElem) => {
    const url = el.bigPicture.url !== "" ? el.bigPicture.url : el.sourcePicture.url;
    let tmpArr = imgGroup;
    const idx = tmpArr.findIndex((t) => t === url);
    if (idx > -1) {
      tmpArr.splice(idx, 1);
    }

    tmpArr.push(url);
    setImgGroup(tmpArr);
    setVisible(true);
  };

  const uuid = () => {
    return (Math.random() * 36).toString(36).slice(2) + new Date().getTime().toString();
  };

  const scrollToBottom = (duration?: number) => {
    animateScroll.scrollTo(0, {
      duration: duration ?? 350,
      smooth: true,
      containerId: "scr_container",
    });
  };

  const sendMsg = (nMsg: string, type: messageTypes, uid?: string, gid?: string) => {
    const operationID = uuid();
    if ((uid && rs.curCve?.userID === uid) || (gid && rs.curCve?.groupID === gid) || (!uid && !gid)) {
      const tMsgMap = {
        oid: operationID,
        mid: JSON.parse(nMsg).clientMsgID,
        flag: false,
      };
      nMsgMaps = [...nMsgMaps, tMsgMap];

      rs.historyMsgList = [JSON.parse(nMsg), ...rs.historyMsgList];
      scrollToBottom();
    }
    const sendOption = {
      recvID: uid ?? rs.curCve!.userID,
      groupID: gid ?? rs.curCve!.groupID,
      onlineUserOnly: false,
      message: nMsg,
    };
    nMsgMaps = nMsgMaps.filter((f) => !f.flag);
    if (notOssMessageTypes.includes(type)) {
      im.sendMessageNotOss(sendOption, operationID)
        .then((res) => {
          sendMsgCB(res, 2);
        })
        .catch((err) => {
          sendMsgCB(err, 3);
        });
    } else {
      im.sendMessage(sendOption, operationID)
        .then((res) => {
          sendMsgCB(res, 2);
        })
        .catch((err) => {
          sendMsgCB(err, 3);
        });
    }
  };

  const sendMsgCB = (res: WsResponse, status: number) => {
    nMsgMaps.map((tn) => {
      if (tn.oid === res.operationID) {
        rs.historyMsgList.map((his) => {
          if (his.clientMsgID === tn?.mid) {
            his.status = status;
            tn.flag = true;
          }
        });
      }
    });
  };

  const closeMer = () => {
    rs.merModal = false;
  };

  const siderSearch = (value: string) => {
    console.log(value);

    if (value) {
      rs.searchStatus = true;
      rs.searchCve = cveList.filter((c) => c.conversationID.indexOf(value) > -1 || c.showName.indexOf(value) > -1);
    } else {
      rs.searchCve = [];
      rs.searchStatus = false;
    }
  };

  return (
    <>
      <HomeSider searchCb={siderSearch}>
        <CveList curCve={rs.curCve} loading={cveLoading} cveList={rs.searchStatus ? rs.searchCve : cveList } clickItem={clickItem} />
      </HomeSider>
      <Layout>
        {rs.curCve && <HomeHeader typing={rs.typing} curCve={rs.curCve} type="chat" />}

        <Content id="chat_main" className={`total_content`}>
          {rs.curCve ? (
            <ChatContent loadMore={getHistoryMsg} loading={loading} msgList={rs.historyMsgList} imgClick={imgClick} hasMore={rs.hasMore} curCve={rs.curCve} />
          ) : (
            <WelcomeContent />
          )}
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              preview={{
                visible,
                onVisibleChange: (vis) => setVisible(vis),
                current: imgGroup.length - 1,
              }}
            >
              {imgGroup.map((img) => (
                <Image key={img} src={img} />
              ))}
            </Image.PreviewGroup>
          </div>
          {rs.merModal && <MerModal visible={rs.merModal} close={closeMer} imgClick={imgClick} info={rs.merData!} />}
        </Content>

        {rs.curCve && <CveFooter curCve={rs.curCve} sendMsg={sendMsg} />}
      </Layout>
      {rs.curCve && <CveRightBar friendInfo={rs.friendInfo} groupMembers={rs.groupMemberList} curCve={rs.curCve} />}
    </>
  );
};

export default Home;
