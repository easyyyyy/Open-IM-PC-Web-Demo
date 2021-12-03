import { EllipsisOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Form,
  message,
} from "antd";
import { FC, useState, useRef, useEffect } from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { GroupItem } from "../../../@types/open_im";
import { RootState } from "../../../store";
import { events, im } from "../../../utils";
import { MyAvatar } from "../../../components/MyAvatar";
import { TOASSIGNCVE } from "../../../constants/events";
import { sessionType } from "../../../constants/messageContentType";

type GroupCardProps = {
  draggableCardVisible: boolean;
  info: GroupItem;
  close: () => void;
};

const GroupCard: FC<GroupCardProps> = ({
  draggableCardVisible,
  info,
  close,
}) => {
  const [draggDisable, setDraggDisable] = useState(false);
  const [inGroup, setInGroup] = useState(false);
  const [step, setStep] = useState<"info" | "send">("info");
  const groupList = useSelector((state:RootState)=>state.contacts.groupList,shallowEqual)
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draRef = useRef<any>(null);

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(()=>{
    if(isInGroup()){
      setInGroup(true)
      setStep("info")
    }else{
      setInGroup(false)
    }
  },[groupList,draggableCardVisible])


  const isInGroup = () => {
    return groupList.findIndex(g=>g.groupID===info.groupID)>-1
  }


  const onStart = (event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = draRef!.current!.getBoundingClientRect();
    setBounds({
      left: -targetRect?.left + uiData?.x,
      right: clientWidth - (targetRect?.right - uiData?.x),
      top: -targetRect?.top + uiData?.y,
      bottom: clientHeight - (targetRect?.bottom - uiData?.y),
    });
  };

  const sendApplication = ({ reqMessage }: { reqMessage: string }) => {
    const param = {
      groupId: info.groupID!,
      message:reqMessage,
    };
    im.joinGroup(param)
      .then((res) => {
        console.log(res);
        message.success("发送入群请求成功！");
        close();
      })
      .catch((err) => {
        message.error("发送入群请求失败！");
      });
  };

  const clickBtn = () => {
    if (inGroup) {
      //TODO to cve
      events.emit(TOASSIGNCVE,info.groupID,sessionType.GROUPCVE)
    } else {
      setStep("send");
    }
  };

  const goBack = () => {
    setStep("info");
    form.resetFields();
  };

  const myClose = () => {
    close();
    setStep("info");
    form.resetFields();
  };

  const nextStep = () => {
    if(inGroup){

    }else{
      setStep("send")
    }
  }

  const InfoTitle = () => {

    return (
      <>
        <div className="left_info">
          <div className="left_info_title">{info.groupName +' ('+info.memberCount+')'}</div>
        </div>
          <MyAvatar
            shape="square"
            src={info.faceUrl}
            size={42}
            icon={<UserOutlined />}
          />
      </>
    );
  }

  const SendTitle = () => (
    <>
      <div className="send_msg_title">
        <LeftOutlined
          className="cancel_drag"
          onClick={goBack}
          style={{ fontSize: "12px", marginRight: "12px" }}
        />
        <div className="send_msg_title_text">群聊验证</div>
      </div>
    </>
  );


  const InfoBody = () => (
    <div className="group_card_body">
      <div className="group_card_title">群成员</div>
      <div className="group_card_member">
        <MyAvatar size={35.3} />
        <MyAvatar size={35.3} />
        <MyAvatar size={35.3} />
        <MyAvatar size={35.3} />
        <MyAvatar size={35.3} />
        <EllipsisOutlined />
      </div>
      <div style={{padding:"8px 0"}} className="group_card_title">{`群ID  ${6456456156156161561}`}</div>
      <Button
        onClick={nextStep}
        className="add_con_btn"
        type="primary"
      >
        { inGroup?'发送消息':'添加群聊' }
      </Button>
    </div>
  );

  const SendBody = () => (
    <>
      <div className="send_card_info">
        <div className="send_card_info_row1">
          <div>{info.groupName}</div>
          <MyAvatar
            src={info.faceUrl}
            size={42}
          />
        </div>
        <Form
          form={form}
          name="basic"
          onFinish={sendApplication}
          autoComplete="off"
        >
          <Form.Item name="reqMessage">
            <Input placeholder="请输入验证信息" />
          </Form.Item>
        </Form>
      </div>
      <Button
        onClick={() => form.submit()}
        className="add_con_btn"
        type="primary"
      >
        发送
      </Button>
    </>
  );

  return (
    <Modal
      // key="UserCard"
      className={step !== "send" ? "draggable_card" : "draggable_card_next"}
      closable={false}
      footer={null}
      mask={false}
      width={280}
      destroyOnClose={true}
      centered
      onCancel={myClose}
      title={
        <div
          className="draggable_card_title"
          onMouseOver={() => {
            if (draggDisable) {
              setDraggDisable(false);
            }
          }}
          onMouseOut={() => {
            setDraggDisable(true);
          }}
        >
          {step === "info" ? <InfoTitle /> : <SendTitle />}
        </div>
      }
      visible={draggableCardVisible}
      modalRender={(modal) => (
        <Draggable
          allowAnyClick={true}
          disabled={draggDisable}
          bounds={bounds}
          onStart={(event, uiData) => onStart(event, uiData)}
          cancel={`.cancel_drag, .cancel_input, .ant-upload,.left_info_icon,.ant-modal-body`}
          enableUserSelectHack={false}
        >
          <div ref={draRef}>{modal}</div>
        </Draggable>
      )}
    >
      { step==="info"?<InfoBody/>:<SendBody/> }
    </Modal>
  );
};

export default GroupCard;
