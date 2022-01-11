import {
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Input, message, Modal, Row } from "antd";
import { FC, useState } from "react";
import { GroupMember } from "../../../../../@types/open_im";
import { MyAvatar } from "../../../../../components/MyAvatar";
import { im } from "../../../../../utils";

type GroupManageProps = {
  adminList: GroupMember[];
  groupMembers:GroupMember[];
  gid:string;
};

const GroupManage: FC<GroupManageProps> = ({ adminList,groupMembers,gid }) => {
  const [visible, setVisible] = useState(false);

  const transfer = (userId:string) => {
      im.transferGroupOwner({groupId:gid,userId}).then(res=>{
          message.success("转让成功！")
          setVisible(false)
      }).catch(err=>message.error("转让失败！"))
  }

  const warning = (item:GroupMember) => {
    Modal.confirm({
      title:"转让群主",
      content:`确认将群主转让给 ${item.nickName}`,
      closable:false,
      className:"warning_modal",
      onOk: ()=>transfer(item.userId)
    })
  }

  return (
    <div className="group_drawer">
      <div className="group_drawer_row">
        <div
          //   onClick={() => changeType("member_list")}
          className="group_drawer_row_title"
        >
          <div>群管理员</div>
          <div>
            <span className="num_tip">0/10</span>
            <RightOutlined />
          </div>
        </div>
        <div className="group_drawer_row_icon">
          {adminList!.length > 0
            ? adminList!.map((gm, idx) => {
                if (idx < 7) {
                  return (
                    <MyAvatar
                      key={gm.userId}
                      shape="square"
                      size={32.8}
                      src={gm.faceUrl}
                      icon={<UserOutlined />}
                    />
                  );
                }
              })
            : null}
          <PlusOutlined onClick={() => {}} />
          <MinusOutlined onClick={() => {}} />
        </div>
      </div>
      <div
        onClick={() => setVisible(true)}
        style={{ border: "none" }}
        className="group_drawer_item"
      >
        <div>转让群主</div>
        <RightOutlined />
      </div>
      <Modal
        title="转让群主"
        className="transfer_modal"
        visible={visible}
        onOk={() => {}}
        onCancel={() => setVisible(false)}
      >
        <Input placeholder="搜索" prefix={<SearchOutlined />} />
        <Row className="gutter_row" gutter={[16, 0]}>
            {
                groupMembers.map(m=>(
                    <Col key={m.userId} onClick={()=>warning(m)} span={6}>
                        <div className="member_item">
                            <MyAvatar src={m.faceUrl} size={36}/>
                            <span className="member_nick">{m.nickName}</span>
                        </div>
                    </Col>
                ))
            }
          
        </Row>
      </Modal>
    </div>
  );
};

export default GroupManage;
