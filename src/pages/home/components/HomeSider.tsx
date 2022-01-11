import { UserAddOutlined, MessageOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Layout, Modal, Input, Button, message } from "antd";
import { cloneElement, FC, forwardRef, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FriendItem, GroupItem, GroupMember, Message, UserInfo } from "../../../@types/open_im";
import { SearchBar } from "../../../components/SearchBar";
import { FORWARDANDMERMSG, OPENGROUPMODAL, OPENSINGLEMODAL, TOASSIGNCVE } from "../../../constants/events";
import { events, im } from "../../../utils";
import GroupCard from "./GroupCard";
import GroupOpModal, { ModalType } from "./GroupOpModal";
import UserCard from "./UserCard";

const { Sider } = Layout;

type AddConModalProps = {
  isAddConsVisible: boolean;
  loading: boolean;
  searchCons: () => void;
  cancleSearch: () => void;
  getNo: (no: string) => void;
  type: "friend" | "group";
};

const AddConModal: FC<AddConModalProps> = ({ isAddConsVisible, loading, searchCons, cancleSearch, getNo, type }) => {
  const { t } = useTranslation();
  return (
    <Modal
      key="AddConModal"
      className="add_cons_modal"
      title={type === "friend" ? t("AddFriend") : t("JoinGroup")}
      visible={isAddConsVisible}
      centered
      destroyOnClose
      width={360}
      onCancel={cancleSearch}
      footer={[
        <Button key="comfirmBtn" loading={loading} onClick={searchCons} className="add_cons_modal_btn" type="primary">
          {t("Confirm")}
        </Button>,
        <Button key="cancelBtn" onClick={cancleSearch} className="add_cons_modal_btn" type="default">
          {t("Cancel")}
        </Button>,
      ]}
    >
      <Input allowClear placeholder={`${t("PleaseInput")}${type === "friend" ? t("User") : t("Gruop")}ID`} onChange={(v) => getNo(v.target.value)} />
    </Modal>
  );
}

type HomeSiderProps = {
  searchCb:(value:string)=>void
};

type GroupInfoType = {
  members: GroupMember[];
  gid: string;
};

const HomeSider: FC<HomeSiderProps> = ({ children,searchCb }) => {
  const [isAddConsVisible, setIsAddConsVisible] = useState(false);
  const [userCardVisible, setUserCardVisible] = useState(false);
  const [groupCardVisible, setGroupCardVisible] = useState(false);
  const [groupOpModalVisible, setGroupOpModalVisible] = useState(false);
  const [forwardMsg,setForwardMsg] = useState('')
  const [addConNo, setAddConNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [serchRes, setSerchRes] = useState({});
  const [addType, setAddType] = useState<"friend" | "group">("friend");
  const [modalType, setModalType] = useState<ModalType>("create");
  const [groupInfo, setGroupInfo] = useState<GroupInfoType>();
  const { t } = useTranslation();

  useEffect(() => {
    events.on(TOASSIGNCVE, assignHandler);
    events.on(OPENSINGLEMODAL, openSingleModalHandler);
    events.on(OPENGROUPMODAL, openGroupModalHandler);
    events.on(FORWARDANDMERMSG,forwardMsgHandler)
    return () => {
      events.off(TOASSIGNCVE, assignHandler);
      events.off(OPENSINGLEMODAL, openSingleModalHandler);
      events.off(OPENGROUPMODAL, openGroupModalHandler);
      events.off(FORWARDANDMERMSG,forwardMsgHandler)
    };
  }, []);

  const forwardMsgHandler = (type:string,options:string) => {
    setModal("forward")
    setForwardMsg(options);
    setGroupOpModalVisible(true)
  }

  const assignHandler = () => {
    setUserCardVisible(false);
    setGroupCardVisible(false);
    setIsAddConsVisible(false);
  };

  const openSingleModalHandler = (info:FriendItem|UserInfo) => {
    setSerchRes(info);
    setUserCardVisible(true);
  }

  const openGroupModalHandler = (type: ModalType, members: GroupMember[], gid: string) => {
    setGroupInfo({ members, gid });
    setModal(type);
  };

  const clickMenuItem = (idx: number) => {
    switch (idx) {
      case 0:
        setAddType("friend");
        setIsAddConsVisible(true);
        break;
      case 1:
        setAddType("group");
        setIsAddConsVisible(true);
        break;
      case 2:
        setModal("create");
        break;
      default:
        break;
    }
  };

  const getNo = (no: string) => {
    setAddConNo(no);
  };

  const menus = [
    {
      title: t("AddFriend"),
      icon: <UserAddOutlined style={{ fontSize: "16px", color: "#fff" }} />,
      method: clickMenuItem,
    },
    {
      title: t("JoinGroup"),
      icon: <UsergroupAddOutlined style={{ fontSize: "16px", color: "#fff" }} />,
      method: clickMenuItem,
    },
    {
      title: t("CreateGroup"),
      icon: <MessageOutlined style={{ fontSize: "16px", color: "#fff" }} />,
      method: clickMenuItem,
    },
  ];

  const searchCons = () => {
    // setUserCardVisible(true)
    if (!addConNo) return;
    setLoading(true);
    if (addType === "friend") {
      im.getUsersInfo([addConNo])
        .then((res) => {
          const tmpArr = JSON.parse(res.data);
          if (tmpArr.length > 0) {
            setSerchRes(tmpArr[0]);
            setUserCardVisible(true);
          } else {
            message.info(t("UserSearchEmpty"));
          }
          setLoading(false);
        })
        .catch((err) => {
          message.error(t("AccessFailed"));
          setLoading(false);
        });
    } else {
      im.getGroupsInfo([addConNo])
        .then((res) => {
          const tmpArr = JSON.parse(res.data);
          if (tmpArr.length > 0) {
            setSerchRes(tmpArr[0]);
            setGroupCardVisible(true);
          } else {
            message.info(t("GroupSearchEmpty"));
          }
          setLoading(false);
        })
        .catch((err) => {
          message.error(t("AccessFailed"));
          setLoading(false);
        });
    }
  };

  const cancleSearch = () => {
    setAddConNo("");
    setIsAddConsVisible(false);
  };

  const closeDragCard = () => {
    setUserCardVisible(false);
    setGroupCardVisible(false);
  };

  const closeOpModal = () => {
    setGroupOpModalVisible(false);
  };

  const setModal = (type: ModalType) => {
    setModalType(type);
    setGroupOpModalVisible(true);
  };

  

  return (
    <Sider width="350" theme="light" className="home_sider" style={{ borderRight: "1px solid #DEDFE0" }}>
      <div style={{ padding: 0 }}>
        <SearchBar searchCb={searchCb} menus={menus} />
        {
          //@ts-ignore
          cloneElement(children, { marginTop: 58 })
        }
      </div>
      {isAddConsVisible && <AddConModal isAddConsVisible={isAddConsVisible} loading={loading} searchCons={searchCons} cancleSearch={cancleSearch} getNo={getNo} type={addType} />}
      {userCardVisible && <UserCard close={closeDragCard} info={serchRes} draggableCardVisible={userCardVisible} />}
      {groupCardVisible && <GroupCard close={closeDragCard} info={serchRes as GroupItem} draggableCardVisible={groupCardVisible} />}
      {groupOpModalVisible && <GroupOpModal options={forwardMsg} groupId={groupInfo?.gid} groupMembers={groupInfo?.members} modalType={modalType} visible={groupOpModalVisible} close={closeOpModal} />}
    </Sider>
  );
};

export default HomeSider;
