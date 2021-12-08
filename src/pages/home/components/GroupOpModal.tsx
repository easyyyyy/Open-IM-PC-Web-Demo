import {
  CloseOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Empty, Input, message, Modal, Upload } from "antd";
import { FC, useEffect, useState } from "react";
import { MyAvatar } from "../../../components/MyAvatar";

import user_select from "@/assets/images/select_user.png";
import group_select from "@/assets/images/select_group.png";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { shallowEqual } from "@babel/types";
import { GroupMember } from "../../../@types/open_im";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { useReactive } from "ahooks";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { cosUpload, im } from "../../../utils";
import InviteMemberBox, { SelectFriendItem, SelectMemberItem } from "./InviteMemberBox";

type GroupOpModalProps = {
  visible: boolean;
  modalType: string;
  groupId?:string;
  groupMembers?: GroupMember[];
  close: () => void;
};

type RsType = {
  groupName: string;
  groupIcon: string;
  searchText: string;
  searchList: SelectFriendItem[];
  friendList: SelectFriendItem[];
  selectedList: SelectFriendItem[] | SelectMemberItem[];
  memberList:SelectMemberItem[]
};

const GroupOpModal: FC<GroupOpModalProps> = ({ visible, modalType,groupId,groupMembers, close }) => {
  const [type, setType] = useState<"friend" | "group" | undefined>();
  const selfID = useSelector((state:RootState)=>state.user.selfInfo.uid)
  const originFriendList = useSelector(
    (state: RootState) => state.contacts.friendList,
    shallowEqual
  );
  // const orginGroupList = useSelector(
  //   (state: RootState) => state.contacts.groupList,
  //   shallowEqual
  // );
  const rs = useReactive<RsType>({
    groupName: "",
    groupIcon: "",
    searchText: "",
    searchList: [],
    friendList: [],
    selectedList: [],
    memberList:[]
  });

  useEffect(() => {
    if(modalType==="remove") return
    rs.friendList = [];
    originFriendList.map((o: any) => {
      o.disabled = false
      if(modalType==="invite"&&groupMembers!.findIndex(m=>m.userId===o.uid)>-1){
        o.disabled = true
      }
      o.check = false;
      rs.friendList = [...rs.friendList, o];
    });
  }, [originFriendList]);

  useEffect(()=>{
    if(modalType==="remove"){
      groupMembers?.map((g:any)=>{
        if(g.userId !== selfID){
          g.disabled = false
        g.check = false
        rs.memberList = [...rs.memberList, g];
        }
        
      })
    }
  },[groupMembers])


  const leftItemClick = (e: CheckboxChangeEvent, item: SelectFriendItem | SelectMemberItem) => {
    if (e.target.checked) {
      //@ts-ignore
      rs.selectedList = [...rs.selectedList, item];
    } else {
      cancelSelect(item);
    }
    item.check = e.target.checked;
  };

  const cancelSelect = (item: SelectFriendItem | SelectMemberItem) => {
    let idx;
    if(modalType==="remove"){
      idx = rs.selectedList.findIndex((s) => (s as SelectMemberItem).userId == (item as SelectMemberItem).userId);
    }else{
      idx = rs.selectedList.findIndex((s) => (s as SelectFriendItem).uid == (item as SelectFriendItem).uid);
    }
    
    rs.selectedList.splice(idx, idx + 1);
    item.check = false;
  };

  const uploadIcon = (uploadData: UploadRequestOption) => {
    cosUpload(uploadData)
      .then((res) => {
        rs.groupIcon = res.url;
      })
      .catch((err) => message.error("图片上传失败！"));
  };

  const groupOperation = () => {
    switch (modalType) {
      case "create":
        createGroup()
        break;
      case "invite":
        inviteToGroup()
        break;
      case "remove":
        kickFromGroup()
        break;
      default:
        break;
    }
  };

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
  }

  const inviteToGroup = () => {
    if(rs.selectedList.length===0){
      message.warning("请先选择邀请成员！")
      return
    }
    let userList:string[] = []
    rs.selectedList.map(s=>userList.push((s as SelectFriendItem).uid))
    const options = {
      groupId:groupId!,
      reason:"",
      userList
    }
    im.inviteUserToGroup(options).then(res=>{
      message.success("邀请成功")
      close()
    }).catch(err=>{
      message.error("邀请失败！")
      close()
    })
  }

  const kickFromGroup = () => {
    if(rs.selectedList.length===0){
      message.warning("请先选择要踢出的成员！")
      return
    }
    let userList:string[] = []
    rs.selectedList.map(s=>userList.push((s as SelectMemberItem).userId))
    const options = {
      groupId:groupId!,
      reason:"",
      userList
    }
    im.kickGroupMember(options).then(res=>{
      message.success("踢出成功！")
      close()
    }).catch(err=>{
      message.error("踢出失败！")
      close()
    })
  }

  const searchUser = (text: string) => {
    rs.searchText = text;
    if (text) {
      rs.searchList = rs.friendList.filter(
        (f) => f.uid.indexOf(text) > -1 || f.name.indexOf(text) > -1
      );
    } else {
      rs.searchList = [];
    }
  };

  const clickMenu = (tp: "friend" | "group" | undefined) => {
    setType(tp);
  };

  return (
    <Modal
      className="group_modal"
      width="680px"
      title={modalType==="create"?"创建群聊":"添加群成员"}
      visible={visible}
      onCancel={close}
      footer={null}
    >
      <div>
        {modalType === "create" ? (
          <>
            <div className="group_info_item">
              <div className="group_info_label">群名称</div>
              <div style={{ width: "100%" }}>
                <Input
                  placeholder="输入群名称"
                  value={rs.groupName}
                  onChange={(e) => (rs.groupName = e.target.value)}
                />
              </div>
            </div>
            <div className="group_info_item">
              <div className="group_info_label">群头像</div>
              <div>
                <MyAvatar src={rs.groupIcon} size={32} />
                <Upload
                  action={""}
                  customRequest={(data) => uploadIcon(data)}
                  showUploadList={false}
                >
                  <span className="group_info_icon">点击修改</span>
                </Upload>
              </div>
            </div>
            <InviteMemberBox
              type={type}
              searchText={rs.searchText}
              searchList={rs.searchList}
              selectedList={rs.selectedList}
              friendList={rs.friendList}
              clickMenu={clickMenu}
              leftItemClick={leftItemClick}
              cancelSelect={cancelSelect}
              searchUser={searchUser}
            />
          </>
        ) : (
          <InviteMemberBox
            type={type}
            searchText={rs.searchText}
            searchList={rs.searchList}
            selectedList={rs.selectedList}
            memberList={rs.memberList}
            friendList={rs.friendList}
            clickMenu={clickMenu}
            leftItemClick={leftItemClick}
            cancelSelect={cancelSelect}
            searchUser={searchUser}
          />
        )}
        <div className="group_info_footer">
          <Button onClick={close}>取消</Button>
          <Button onClick={groupOperation} type="primary">
            确定
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupOpModal;
