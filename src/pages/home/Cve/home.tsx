import { Button, Image, Layout, message, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import {
  Cve,
  FriendItem,
  GroupMember,
  Message,
  PictureElem,
} from "../../../@types/open_im";
import { RootState } from "../../../store";
import CveList from "./CveList";
import CveFooter from "./CveFooter";
import CveRightBar from "./CveRightBar";
import HomeSider from "../components/HomeSider";
import HomeHeader from "../components/HomeHeader";
import { events, im, isSingleCve } from "../../../utils";
import ChatContent from "./ChatContent";
import home_bg from "@/assets/images/home_bg.png";
import {
  messageTypes,
  notOssMessageTypes,
  sessionType,
} from "../../../constants/messageContentType";
import { WsResponse } from "open-im-sdk/im";
import { useReactive, useRequest } from "ahooks";
import { CbEvents } from "../../../utils/src";
import {
  DELETEMESSAGE,
  OPENGROUPMODAL,
  RESETCVE,
  TOASSIGNCVE,
  UPDATEFRIENDCARD,
  UPDATEPIN,
} from "../../../constants/events";
import { scroller,animateScroll } from "react-scroll";

const { Content } = Layout;

type NMsgMap = {
  oid: string;
  mid: string;
  flag: boolean;
};

const WelcomeContent = () => {
  const createGroup = () => {
    events.emit(OPENGROUPMODAL,"create")
  }
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
}

type ReactiveState = {
  historyMsgList: Message[];
  groupMemberList: GroupMember[];
  friendInfo: FriendItem;
  curCve: Cve | null;
  typing: boolean;
  hasMore: boolean;
  loading: boolean;
};

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [imgGroup, setImgGroup] = useState<Array<string>>([]);
  const selectCveList = (state: RootState) => state.cve.cves;
  const cveList = useSelector(selectCveList, shallowEqual);
  const selectCveLoading = (state: RootState) => state.cve.cveInitLoading;
  const cveLoading = useSelector(selectCveLoading, shallowEqual);
  const selfID = useSelector((state: RootState) => state.user.selfInfo.uid);
  const reactiveState = useReactive<ReactiveState>({
    historyMsgList: [],
    groupMemberList: [],
    friendInfo: {} as FriendItem,
    curCve: null,
    typing: false,
    hasMore: true,
    loading: false,
  });
  const timer = useRef<NodeJS.Timeout | null>(null);
  const {
    loading,
    run: getMsg,
    cancel: msgCancel,
  } = useRequest(im.getHistoryMessageList, {
    manual:true,
    onSuccess: handleMsg,
    onError:(err)=>message.error("获取聊天记录失败！")
  });

  let nMsgMaps: NMsgMap[] = [];

  useEffect(() => {
    im.on(CbEvents.ONRECVNEWMESSAGE, (data) => {
      console.log(reactiveState.curCve);
      console.log(data);

      if (reactiveState.curCve) {
        const newServerMsg: Message = JSON.parse(data.data);
        if (inCurCve(newServerMsg)) {
          if (newServerMsg.contentType === messageTypes.TYPINGMESSAGE) {
            typingUpdate();
          } else {
            reactiveState.historyMsgList = [
              newServerMsg,
              ...reactiveState.historyMsgList,
            ];
            if (isSingleCve(reactiveState.curCve)) {
              markC2CHasRead(reactiveState.curCve.userID, [
                newServerMsg.clientMsgID,
              ]);
            }
            markCveHasRead(reactiveState.curCve);
          }
        }
      }
    });

    im.on(CbEvents.ONRECVMESSAGEREVOKED, (data) => {
      console.log(data);
      const idx = reactiveState.historyMsgList.findIndex(
        (m) => m.clientMsgID === data.data
      );
      if (idx > -1) {
        reactiveState.historyMsgList.splice(idx, 1);
      }
    });

    im.on(CbEvents.ONRECVC2CREADRECEIPT, (data) => {
      JSON.parse(data.data).map((cr: any) => {
        cr.msgIDList.map((crt: string) => {
          reactiveState.historyMsgList.find((hism) => {
            if (hism.clientMsgID === crt) {
              hism.isRead = true;
            }
          });
        });
      });
    });

    im.on(CbEvents.ONMEMBERINVITED, (data) => {
      reactiveState.groupMemberList = [
        ...reactiveState.groupMemberList,
        ...JSON.parse(JSON.parse(data.data).memberList),
      ];
    });

    im.on(CbEvents.ONMEMBERKICKED, (data) => {
      let idxs: number[] = [];
      const users: GroupMember[] = JSON.parse(JSON.parse(data.data).memberList);
      users.map((u) => {
        reactiveState.groupMemberList.map((gm, idx) => {
          if (u.userId === gm.userId) {
            idxs.push(idx);
          }
        });
      });
      idxs.map((i) => reactiveState.groupMemberList.splice(i, i + 1));
    });

    im.on(CbEvents.ONGROUPINFOCHANGED, (data) => {
      console.log(JSON.parse(data.data));
    });

    im.on(CbEvents.ONMEMBERENTER, (data) => {
      console.log(JSON.parse(data.data));
    });

    im.on(CbEvents.ONMEMBERLEAVE, (data) => {
      console.log(JSON.parse(data.data));
    });

    return () => {
      im.off(CbEvents.ONRECVNEWMESSAGE, () => {});
      im.off(CbEvents.ONRECVMESSAGEREVOKED, () => {});
      im.off(CbEvents.ONRECVC2CREADRECEIPT, () => {});
    };
  }, []);

  useEffect(() => {
    events.on(UPDATEFRIENDCARD, (id: string) => {
      getFriendInfo(id);
    });
    events.on(TOASSIGNCVE, (id: string, type: sessionType) => {
      getOneCve(id, type)
        .then((cve) => clickItem(cve))
        .catch((err) => message.error("获取会话失败！"));
    });
    events.on(RESETCVE, () => {
      resetCve();
    });
    events.on(UPDATEPIN, (flag: number) => {
      reactiveState.curCve!.isPinned = flag;
    });
    events.on(DELETEMESSAGE, (mid: string) => {
      deleteMsg(mid);
    });
    return () => {
      events.off(UPDATEFRIENDCARD, () => {});
      events.off(TOASSIGNCVE, () => {});
      events.off(RESETCVE, () => {});
      events.off(UPDATEPIN, () => {});
    };
  }, []);

  const inCurCve = (newServerMsg: Message): boolean => {
    console.log(newServerMsg);
    console.log(reactiveState.curCve);

    return (
      (newServerMsg.sendID === reactiveState.curCve?.userID &&
        newServerMsg.recvID === selfID) ||
      newServerMsg.recvID === reactiveState.curCve?.groupID
    );
  };

  const resetCve = () => {
    reactiveState.curCve = null;
  };

  const deleteMsg = (mid: string) => {};

  const typingUpdate = () => {
    reactiveState.typing = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      reactiveState.typing = false;
    }, 1000);
  };

  const clickItem = (cve: Cve) => {
    if (cve.conversationID === reactiveState.curCve?.conversationID) return;
    reactiveState.historyMsgList.length = 0;
    reactiveState.curCve = cve;
    reactiveState.hasMore = true;
    msgCancel()
    setImgGroup([]);
    getHistoryMsg(cve.userID, cve.groupID);
    markCveHasRead(cve);
    if (!isSingleCve(cve)) {
      getGroupMembers(cve.groupID);
    } else {
      getFriendInfo(cve.userID);
    }
  };

  const markCveHasRead = (cve: Cve) => {
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
      console.log(JSON.parse(res.data));
      reactiveState.groupMemberList = JSON.parse(res.data).data;
    });
  };

  const getFriendInfo = (fid: string) => {
    im.getFriendsInfo([fid]).then((res) => {
      console.log(JSON.parse(res.data));
      reactiveState.friendInfo = JSON.parse(res.data)[0];
    });
  };

  const markC2CHasRead = (receiver: string, msgIDList: string[]) => {
    im.markC2CMessageAsRead({ receiver, msgIDList })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  const getHistoryMsg = (uid?: string, gid?: string, sMsg?: any) => {
    reactiveState.loading = true;

    const config = {
      userID: uid ?? "",
      groupID: gid ?? "",
      count: 20,
      startMsg: sMsg ?? null,
    };

    getMsg(config);

    // console.log(msgData);

    // im.getHistoryMessageList(config)
    //   .then((res) => {
    // if (JSON.parse(res.data).length === 0) {
    //   reactiveState.hasMore = false;
    //   return;
    // }
    // if (
    //   JSON.stringify(
    //     reactiveState.historyMsgList[
    //       reactiveState.historyMsgList.length - 1
    //     ]
    //   ) == JSON.stringify(JSON.parse(res.data).reverse()[0])
    // ) {
    //   reactiveState.historyMsgList.pop();
    // }

    // if (isSingleCve(reactiveState.curCve!)) {
    //   let unReads: string[] = [];
    //   (JSON.parse(res.data) as Message[]).map((m) => {
    //     if (!m.isRead) {
    //       unReads.push(m.clientMsgID);
    //     }
    //   });
    //   markC2CHasRead(reactiveState.curCve?.userID!, unReads);
    // }

    // reactiveState.historyMsgList = [
    //   ...reactiveState.historyMsgList,
    //   ...JSON.parse(res.data).reverse(),
    // ];
    // console.log(reactiveState.historyMsgList);

    // if (JSON.parse(res.data).length < 20) {
    //   reactiveState.hasMore = false;
    // } else {
    //   reactiveState.hasMore = true;
    // }
    // reactiveState.loading = false;
    //   })
    //   .catch((err) => {
    //     message.error("获取历史消息失败！");
    //     reactiveState.loading = false;
    //   });
  };

  function handleMsg(res: WsResponse) {
    if (JSON.parse(res.data).length === 0) {
      reactiveState.hasMore = false;
      return;
    }
    if (
      JSON.stringify(
        reactiveState.historyMsgList[reactiveState.historyMsgList.length - 1]
      ) == JSON.stringify(JSON.parse(res.data).reverse()[0])
    ) {
      reactiveState.historyMsgList.pop();
    }

    if (isSingleCve(reactiveState.curCve!)) {
      let unReads: string[] = [];
      (JSON.parse(res.data) as Message[]).map((m) => {
        if (!m.isRead) {
          unReads.push(m.clientMsgID);
        }
      });
      markC2CHasRead(reactiveState.curCve?.userID!, unReads);
    }

    reactiveState.historyMsgList = [
      ...reactiveState.historyMsgList,
      ...JSON.parse(res.data).reverse(),
    ];
    console.log(reactiveState.historyMsgList);

    if (JSON.parse(res.data).length < 20) {
      reactiveState.hasMore = false;
    } else {
      reactiveState.hasMore = true;
    }
    reactiveState.loading = false;
  }

  const imgClick = (el: PictureElem) => {
    const url =
      el.bigPicture.url !== "" ? el.bigPicture.url : el.sourcePicture.url;
    let tmpArr = imgGroup;
    const idx = tmpArr.findIndex((t) => t === url);
    if (idx > -1) {
      tmpArr.splice(idx, idx + 1);
    }

    tmpArr.push(url);
    setImgGroup(tmpArr);
    setVisible(true);
  };

  const uuid = () => {
    return (
      (Math.random() * 36).toString(36).slice(2) +
      new Date().getTime().toString()
    );
  };

  const scrollToBottom = (duration?: number) => {
    animateScroll.scrollTo(0,{
      duration: duration ?? 350,
      smooth: true,
      containerId: "scr_container",
    });
  };

  const sendMsg = (nMsg: string, type: messageTypes) => {
    const operationID = uuid();
    const tMsgMap = {
      oid: operationID,
      mid: JSON.parse(nMsg).clientMsgID,
      flag: false,
    };
    nMsgMaps = [...nMsgMaps, tMsgMap];

    reactiveState.historyMsgList = [
      JSON.parse(nMsg),
      ...reactiveState.historyMsgList,
    ];
    scrollToBottom();
    const sendOption = {
      recvID: reactiveState.curCve!.userID,
      groupID: reactiveState.curCve!.groupID,
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
        reactiveState.historyMsgList.map((his) => {
          if (his.clientMsgID === tn?.mid) {
            his.status = status;
            tn.flag = true;
          }
        });
      }
    });
  };

  return (
    <>
      <HomeSider>
        <CveList
          curCve={reactiveState.curCve}
          loading={cveLoading}
          cveList={cveList}
          clickItem={clickItem}
        />
      </HomeSider>
      <Layout>
        {reactiveState.curCve && (
          <HomeHeader
            typing={reactiveState.typing}
            curCve={reactiveState.curCve}
            type="chat"
          />
        )}

        <Content id="chat_main" className={`total_content`}>
          {reactiveState.curCve ? (
            <ChatContent
              loadMore={getHistoryMsg}
              loading={loading}
              msgList={reactiveState.historyMsgList}
              imgClick={imgClick}
              hasMore={reactiveState.hasMore}
              curCve={reactiveState.curCve}
            />
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
        </Content>

        {reactiveState.curCve && (
          <CveFooter curCve={reactiveState.curCve} sendMsg={sendMsg} />
        )}
      </Layout>
      {reactiveState.curCve && (
        <CveRightBar
          friendInfo={reactiveState.friendInfo}
          groupMembers={reactiveState.groupMemberList}
          curCve={reactiveState.curCve}
        />
      )}
    </>
  );
};

export default Home;
