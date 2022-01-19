import { Button, Image, Layout, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Cve, FriendItem, GroupItem, GroupMember, MergeElem, Message, PictureElem } from "../../../@types/open_im";
import { RootState } from "../../../store";
import CveList from "./CveList/CveList";
import CveFooter from "./CveFooter/CveFooter";
import CveRightBar from "./CveRightBar";
import HomeSider from "../components/HomeSider";
import HomeHeader from "../components/HomeHeader";
import { createNotification, events, getNotification, im, isSingleCve, parseMessageType } from "../../../utils";
import ChatContent from "./ChatContent";
import home_bg from "@/assets/images/home_bg.png";
import { messageTypes, notOssMessageTypes, SessionType, tipsTypes } from "../../../constants/messageContentType";
import { useReactive, useRequest } from "ahooks";
import { CbEvents } from "../../../utils/open_im_sdk";
import { DELETEMESSAGE, ISSETDRAFT, MERMSGMODAL, OPENGROUPMODAL, RESETCVE, REVOKEMSG, SENDFORWARDMSG, TOASSIGNCVE, UPDATEFRIENDCARD } from "../../../constants/events";
import { animateScroll } from "react-scroll";
import MerModal from "./components/MerModal";
import { SelectType } from "../components/MultipleSelectBox";
import { getGroupMemberList, setGroupMemberList } from "../../../store/actions/contacts";
import { MergerMsgParams, WsResponse } from "../../../utils/open_im_sdk/types";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

type NMsgMap = {
  oid: string;
  mid: string;
  flag: boolean;
};

const WelcomeContent = () => {
  const { t } = useTranslation();
  const createGroup = () => {
    events.emit(OPENGROUPMODAL, "create");
  };
  return (
    <div className="content_bg">
      <div className="content_bg_title">{t("CreateGroup")}</div>
      <div className="content_bg_sub">{t("CreateGroupTip")}</div>
      <img src={home_bg} alt="" />
      <Button onClick={createGroup} className="content_bg_btn" type="primary">
        {t("CreateNow")}
      </Button>
    </div>
  );
};

type ReactiveState = {
  historyMsgList: Message[];
  // groupMemberList: GroupMember[];
  groupInfo: GroupItem;
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
  const selfID = useSelector((state: RootState) => state.user.selfInfo.uid, shallowEqual);
  const groupMemberList = useSelector((state: RootState) => state.contacts.groupMemberList, shallowEqual);
  const dispatch = useDispatch();
  const rs = useReactive<ReactiveState>({
    historyMsgList: [],
    // groupMemberList: [],
    groupInfo: {} as GroupItem,
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
    onError: (err) => message.error(t("GetChatRecordFailed")),
  });
  const { t } = useTranslation();

  let nMsgMaps: NMsgMap[] = [];

  useEffect(()=>{
    getNotification()
  },[])

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
    window.electron&&window.electron.addIpcRendererListener("DownloadFinish",downloadFinishHandler,"downloadListener")
    return () => {
      events.off(UPDATEFRIENDCARD, updateCardHandler);
      events.off(TOASSIGNCVE, assignHandler);
      events.off(RESETCVE, resetCve);
      events.off(DELETEMESSAGE, deleteMsg);
      events.off(REVOKEMSG, revokeMyMsgHandler);
      events.off(MERMSGMODAL, merModalHandler);
      events.off(SENDFORWARDMSG, sendForwardHandler);
      window.electron&&window.electron.removeIpcRendererListener("downloadListener")
    };
  }, []);

  //  event hander
  const updateCardHandler = (info: FriendItem) => {
    if (info.uid === rs.curCve?.userID) {
      rs.curCve.showName = info.comment;
    }
    if (info.uid === rs.friendInfo.uid) {
      rs.friendInfo = info;
    }
  };

  const merModalHandler = (el: MergeElem, sender: string) => {
    rs.merData = { ...el, sender };
    rs.merModal = true;
  };

  const assignHandler = (id: string, type: SessionType) => {
    getOneCve(id, type)
      .then((cve) => clickItem(cve))
      .catch((err) => message.error(t("GetCveFailed")));
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
    const newServerMsg: Message = JSON.parse(data.data);
    if(newServerMsg.contentType !== messageTypes.TYPINGMESSAGE && newServerMsg.sendID !== selfID){
      createNotification(newServerMsg,(id,sessionType)=>{
        assignHandler(id,sessionType)
        window.electron?window.electron.focusHomePage():window.focus()
      })
    }
    if (rs.curCve) {
      if (inCurCve(newServerMsg)) {
        if (newServerMsg.contentType === messageTypes.TYPINGMESSAGE) {
          typingUpdate();
        } else {
          if (newServerMsg.contentType === messageTypes.REVOKEMESSAGE) {
            rs.historyMsgList = [newServerMsg, ...rs.historyMsgList.filter((ms) => ms.clientMsgID !== newServerMsg.content)];
          } else {
            rs.historyMsgList = [newServerMsg, ...rs.historyMsgList];
          }

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
    let tmp = groupMemberList ?? [];
    tmp = [...tmp, ...JSON.parse(JSON.parse(data.data).memberList)];
    dispatch(setGroupMemberList(tmp));
  };

  const memberKickHandler = (data: WsResponse) => {
    const tmp = groupMemberList;
    let idxs: number[] = [];
    const users: GroupMember[] = JSON.parse(JSON.parse(data.data).memberList);
    users.map((u) => {
      tmp.map((gm, idx) => {
        if (u.userId === gm.userId) {
          idxs.push(idx);
        }
      });
    });
    idxs.map((i) => tmp.splice(i, 1));
    dispatch(setGroupMemberList(tmp));
  };

  //  ipc hander
  const downloadFinishHandler = (ev:any,state:'completed' | 'cancelled' | 'interrupted') => {
    switch (state) {
      case "completed":
        message.success("下载成功！")
        break;
      case "cancelled":
        message.warn("下载已取消！")
        break;
      case "interrupted":
        message.error("下载失败！")
        break;
      default:
        break;
    }
    
  }

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
    message.success(t("DeleteMessageSuc"));
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
    getInfo(cve);
    msgCancel();
    setImgGroup([]);
    getHistoryMsg(cve.userID, cve.groupID);
    markCveHasRead(cve);
  };

  const getInfo = (cve: Cve) => {
    if (!isSingleCve(cve)) {
      getGroupInfo(cve.groupID);
      const options = {
        groupId: cve.groupID,
        next: 0,
        filter: 0,
      };
      dispatch(getGroupMemberList(options));
    } else {
      getFriendInfo(cve.userID);
    }
  };

  const getGroupInfo = (gid: string) => {
    im.getGroupsInfo([gid]).then((res) => {
      rs.groupInfo = JSON.parse(res.data)[0];
    });
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
      const parsedMsg = JSON.parse(nMsg);
      const tMsgMap = {
        oid: operationID,
        mid: parsedMsg.clientMsgID,
        flag: false,
      };
      nMsgMaps = [...nMsgMaps, tMsgMap];
      parsedMsg.status = 2;
      rs.historyMsgList = [parsedMsg, ...rs.historyMsgList];
      setTimeout(() => {
        const item = nMsgMaps.find(n=>n.mid===parsedMsg.clientMsgID)
        if(item&&!item.flag){
          rs.historyMsgList.find(h=>{
            if(h.clientMsgID===item.mid){
              h.status = 1;
            }
          })
        }
      },2000)
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
        <CveList curCve={rs.curCve} loading={cveLoading} cveList={rs.searchStatus ? rs.searchCve : cveList} clickItem={clickItem} />
      </HomeSider>
      <Layout>
        {rs.curCve && <HomeHeader ginfo={rs.groupInfo} typing={rs.typing} curCve={rs.curCve} type="chat" />}

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
      {rs.curCve && <CveRightBar friendInfo={rs.friendInfo} curCve={rs.curCve} />}
    </>
  );
};

export default Home;
