import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal } from "antd";
import { FC } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { FriendItem } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { RootState } from "../../../../store";

type CardMsgModalProps = {
  visible: boolean;
  close: ()=>void;
  cb: (sf:FriendItem)=>void;
};

const CardMsgModal: FC<CardMsgModalProps> = ({ visible,close,cb }) => {
    const friendList = useSelector((state:RootState)=>state.contacts.friendList,shallowEqual)

  return <Modal wrapClassName="card_cons_se" title="选择联系人名片" visible={visible} footer={null} onCancel={close} width="320px" className="card_se_modal">
      <div className="top_ctx">
      <Input placeholder="搜索" prefix={<SearchOutlined />} />
      </div>
      <div className="btm_ctx">
          <div className="title">我的好友</div>
          <div className="cons_list">
                {
                    friendList.map(f=>(
                        <div key={f.uid} className="cons_list_item">
                    <div className="cons_list_item_left">
                    <MyAvatar size={32} src={f.icon}/>
                    <div className="nick">{f.comment==""?f.name:f.comment}</div>
                    </div>
                    <Button onClick={()=>{
                        cb(f);
                        close();
                    }} ghost type="primary" size="small">发送</Button>
                </div>
                    ))
                }
          </div>
      </div>
  </Modal>;
};

export default CardMsgModal;
