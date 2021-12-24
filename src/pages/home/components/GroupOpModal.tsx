import { CloseOutlined, RightOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, Empty, Input, message, Modal, Upload } from "antd";
import { FC, useEffect, useState } from "react";
import { MyAvatar } from "../../../components/MyAvatar";

import user_select from "@/assets/images/select_user.png";
import group_select from "@/assets/images/select_group.png";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { shallowEqual } from "@babel/types";
import { GroupMember, Message } from "../../../@types/open_im";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useReactive } from "ahooks";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { cosUpload, events, im } from "../../../utils";
import InviteMemberBox, { SelectFriendItem, SelectGroupItem, SelectMemberItem, SelectType } from "./InviteMemberBox";
import { SENDFORWARDMSG } from "../../../constants/events";
import { messageTypes } from "../../../constants/messageContentType";

type GroupOpModalProps = {
  visible: boolean;
  modalType: ModalType;
  groupId?: string;
  groupMembers?: GroupMember[];
  options?:string;
  close: () => void;
};

export type ModalType = "create"|"invite"|"remove"|"forward"

type RsType = {
  groupName: string;
  groupIcon: string;
  friendList: SelectFriendItem[];
  groupList: SelectGroupItem[]
  selectedList: SelectType[];
  memberList: SelectMemberItem[];
};

const GroupOpModal: FC<GroupOpModalProps> = ({ visible,options, modalType, groupId, groupMembers, close }) => {
  const selfID = useSelector((state: RootState) => state.user.selfInfo.uid);
  const originFriendList = useSelector((state: RootState) => state.contacts.friendList, shallowEqual);
  const originGroupList = useSelector((state: RootState) => state.contacts.groupList, shallowEqual);
  const rs = useReactive<RsType>({
    groupName: "",
    groupIcon: "",
    friendList: [],
    groupList: [],
    selectedList: [],
    memberList: [],
  });

  useEffect(() => {
    if (modalType === "remove") return;
    rs.friendList = [];
    originFriendList.map((o: any) => {
      o.disabled = false;
      if (modalType === "invite" && groupMembers!.findIndex((m) => m.userId === o.uid) > -1) {
        o.disabled = true;
      }
      o.check = false;
      rs.friendList = [...rs.friendList, o];
    });
  }, [originFriendList]);

  useEffect(() => {
    if (modalType === "remove") {
      groupMembers?.map((g: any) => {
        if (g.userId !== selfID) {
          g.disabled = false;
          g.check = false;
          rs.memberList = [...rs.memberList, g];
        }
      });
    }
  }, [groupMembers]);

  useEffect(() => {
    if (modalType === "forward") {
      originGroupList?.map((g: any) => {
        g.disabled = false;
        g.check = false;
        rs.groupList = [...rs.groupList, g];
      });
    }
  }, [originGroupList]);

  const uploadIcon = (uploadData: UploadRequestOption) => {
    cosUpload(uploadData)
      .then((res) => {
        rs.groupIcon = res.url;
      })
      .catch((err) => message.error("图片上传失败！"));
  };

  const modalOperation = () => {
    switch (modalType) {
      case "create":
        createGroup();
        break;
      case "invite":
        inviteToGroup();
        break;
      case "remove":
        kickFromGroup();
        break;
      case "forward":
        forwardMsg();
        break;
      default:
        break;
    }
  };

  const forwardMsg = () => {
    const parseMsg = JSON.parse(options!)
    events.emit(SENDFORWARDMSG,parseMsg.contentType?options:parseMsg,parseMsg.contentType??messageTypes.MERGERMESSAGE,rs.selectedList)
    close()
  }

  const createGroup = () => {
    if (!rs.groupIcon || !rs.groupName || rs.selectedList.length == 0) {
      message.warning("请先完成信息填写！");
      return;
    }

    let memberList: any = [];
    rs.selectedList.map((s) => {
      memberList.push({
        uid: (s as SelectFriendItem).uid,
        setRole: 0,
      });
    });
    const options = {
      gInfo: {
        groupName: rs.groupName,
        introduction: "",
        notification: "",
        faceUrl: rs.groupIcon,
      },
      memberList,
    };

    im.createGroup(options)
      .then((res) => {
        message.success("创建群聊成功！");
        close();
      })
      .catch((err) => {
        message.error("创建群聊失败！");
        close();
      });
  };

  const inviteToGroup = () => {
    if (rs.selectedList.length === 0) {
      message.warning("请先选择邀请成员！");
      return;
    }
    let userList: string[] = [];
    rs.selectedList.map((s) => userList.push((s as SelectFriendItem).uid));
    const options = {
      groupId: groupId!,
      reason: "",
      userList,
    };
    im.inviteUserToGroup(options)
      .then((res) => {
        message.success("邀请成功");
        close();
      })
      .catch((err) => {
        message.error("邀请失败！");
        close();
      });
  };

  const kickFromGroup = () => {
    if (rs.selectedList.length === 0) {
      message.warning("请先选择要踢出的成员！");
      return;
    }
    let userList: string[] = [];
    rs.selectedList.map((s) => userList.push((s as SelectMemberItem).userId));
    const options = {
      groupId: groupId!,
      reason: "",
      userList,
    };
    im.kickGroupMember(options)
      .then((res) => {
        message.success("踢出成功！");
        close();
      })
      .catch((err) => {
        message.error("踢出失败！");
        close();
      });
  };

  const selectChange = (selectList: SelectType[]) => {
    rs.selectedList = selectList;
  };

  const switchTitle = () => {
    switch (modalType) {
      case "create":
        return "创建群聊"
      case "invite":
        return "添加成员"
      case "remove":
        return "移除成员"
      case "forward":
        return "转发消息"      
      default:
        return ""
    }
  }

  return (
    <Modal width="60%" className="group_modal" title={switchTitle()} visible={visible} onCancel={close} footer={null} centered>
      <div>
        {modalType === "create" ? (
          <>
            <div className="group_info_item">
              <div className="group_info_label">群名称</div>
              <div style={{ width: "100%" }}>
                <Input placeholder="输入群名称" value={rs.groupName} onChange={(e) => (rs.groupName = e.target.value)} />
              </div>
            </div>
            <div className="group_info_item">
              <div className="group_info_label">群头像</div>
              <div>
                <MyAvatar src={rs.groupIcon} size={32} />
                <Upload action={""} customRequest={(data) => uploadIcon(data)} showUploadList={false}>
                  <span className="group_info_icon">点击修改</span>
                </Upload>
              </div>
            </div>
            <InviteMemberBox modalType={modalType} friendList={rs.friendList} onSelectedChange={selectChange} />
          </>
        ) : (
          <InviteMemberBox modalType={modalType} memberList={rs.memberList} friendList={rs.friendList} groupList={rs.groupList} onSelectedChange={selectChange} />
        )}
        <div className="group_info_footer">
          <Button onClick={close}>取消</Button>
          <Button onClick={modalOperation} type="primary">
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupOpModal;
