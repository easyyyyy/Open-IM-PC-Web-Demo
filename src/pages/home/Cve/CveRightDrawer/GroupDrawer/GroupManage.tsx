import {
  MinusOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Input, message, Modal, Row } from "antd";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const transfer = (userId:string) => {
      im.transferGroupOwner({groupId:gid,userId}).then(res=>{
          message.success(t("TransferSuc"))
          setVisible(false)
      }).catch(err=>message.error(t("TransferFailed")))
  }

  const warning = (item:GroupMember) => {
    Modal.confirm({
      title:t("TransferGroup"),
      content: t("TransferTip")+" "+item.nickName,
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
          <div>{t("GroupAdministrators")}</div>
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
        <div>{t("TransferGroup")}</div>
        <RightOutlined />
      </div>
      <Modal
        title={t("TransferGroup")}
        className="transfer_modal"
        visible={visible}
        onOk={() => {}}
        onCancel={() => setVisible(false)}
      >
        <Input placeholder={t("Search")} prefix={<SearchOutlined />} />
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
