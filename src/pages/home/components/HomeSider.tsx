import {
  UserAddOutlined,
  MessageOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Layout, Modal, Input, Button, message } from "antd";
import {
  cloneElement,
  FC,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { GroupItem } from "../../../@types/open_im";
import { SearchBar } from "../../../components/SearchBar";
import { TOASSIGNCVE } from "../../../constants/events";
import { events, im } from "../../../utils";
import GroupCard from "./GroupCard";
import UserCard from "./UserCard";

const RefSearchBar = forwardRef(SearchBar);

const { Sider } = Layout;

type AddConModalProps = {
  isAddConsVisible: boolean;
  loading: boolean;
  searchCons: () => void;
  cancleSearch: () => void;
  getNo: (no: string) => void;
  type: "friend" | "group";
};

const AddConModal: FC<AddConModalProps> = ({
  isAddConsVisible,
  loading,
  searchCons,
  cancleSearch,
  getNo,
  type,
}) => (
  <Modal
    key="AddConModal"
    className="add_cons_modal"
    title={type === "friend" ? "添加好友" : "添加群聊"}
    visible={isAddConsVisible}
    centered
    destroyOnClose
    width={360}
    onCancel={cancleSearch}
    footer={[
      <Button
        key="comfirmBtn"
        loading={loading}
        onClick={searchCons}
        className="add_cons_modal_btn"
        type="primary"
      >
        确定
      </Button>,
      <Button
        key="cancelBtn"
        onClick={cancleSearch}
        className="add_cons_modal_btn"
        type="default"
      >
        取消
      </Button>,
    ]}
  >
    <Input
      allowClear
      placeholder={`请输入${type === "friend" ? "用户" : "群聊"}ID`}
      onChange={(v) => getNo(v.target.value)}
    />
  </Modal>
);

type HomeSiderProps = {};

const HomeSider: FC<HomeSiderProps> = ({ children }) => {
  const [isAddConsVisible, setIsAddConsVisible] = useState(false);
  const [userCardVisible, setUserCardVisible] = useState(false);
  const [groupCardVisible, setGroupCardVisible] = useState(false);
  const [addConNo, setAddConNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [serchRes, setSerchRes] = useState({});
  const [addType, setAddType] = useState<"friend" | "group">("friend");
  const compRef = useRef(null);

  useEffect(() => {
    events.on(TOASSIGNCVE, () => {
      setUserCardVisible(false);
      setGroupCardVisible(false);
      setIsAddConsVisible(false);
    });
    return () => {
      events.off(TOASSIGNCVE, () => {});
    };
  }, []);

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
      default:
        break;
    }
  };

  const getNo = (no: string) => {
    setAddConNo(no);
  };

  const menus = [
    {
      title: "添加好友",
      icon: <UserAddOutlined style={{ fontSize: "16px", color: "#fff" }} />,
      method: clickMenuItem,
    },
    {
      title: "添加群聊",
      icon: (
        <UsergroupAddOutlined style={{ fontSize: "16px", color: "#fff" }} />
      ),
      method: clickMenuItem,
    },
    {
      title: "创建群聊",
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
            message.info("用户搜索结果为空！");
          }
          setLoading(false);
        })
        .catch((err) => {
          message.error("请求失败，请重试！");
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
            message.info("群聊搜索结果为空！");
          }
          setLoading(false);
        })
        .catch((err) => {
          message.error("请求失败，请重试！");
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

  return (
    <Sider
      width="350"
      theme="light"
      style={{ borderRight: "1px solid #DEDFE0" }}
    >
      <div style={{ padding: 0 }}>
        <RefSearchBar menus={menus} ref={compRef} />
        {
          //@ts-ignore
          cloneElement(children, { marginTop: 58 })
        }
      </div>
      {isAddConsVisible && (
        <AddConModal
          isAddConsVisible={isAddConsVisible}
          loading={loading}
          searchCons={searchCons}
          cancleSearch={cancleSearch}
          getNo={getNo}
          type={addType}
        />
      )}
      {userCardVisible && (
        <UserCard
          close={closeDragCard}
          info={serchRes}
          draggableCardVisible={userCardVisible}
        />
      )}
      {groupCardVisible && (
        <GroupCard
          close={closeDragCard}
          info={serchRes as GroupItem}
          draggableCardVisible={groupCardVisible}
        />
      )}
    </Sider>
  );
};

export default HomeSider;
