import { RightOutlined, TeamOutlined } from "@ant-design/icons";
import { Switch, Button, message } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Cve, FriendItem } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";
import { im } from "../../../../utils";

type SingleDrawerProps = {
  curCve: Cve;
  info?: FriendItem;
  openCard: () => void;
  updatePin: () => void;
  delFriend: () => void;
};

const SingleDrawer: FC<SingleDrawerProps> = ({
  curCve,
  info,
  openCard,
  updatePin,
  delFriend,
}) => {
  const { t } = useTranslation();
  const blackListChnage = (e:boolean) => {
    if(e){
      im.addToBlackList(info?.uid!).then(res=>{
        info!.isInBlackList = 1
        message.success(t("AddBlackSuc"))
      }).catch(err=>message.error(t("AddBlackFailed")))
    }else{
      im.deleteFromBlackList(info?.uid!).then(res=>info!.isInBlackList = 0)
        .catch(err=>message.error(t("RemoveBlackFailed")))
    }
  }
  
  return (
    <div className="single_drawer">
      <div onClick={openCard} className="single_drawer_item">
        <div className="single_drawer_item_left">
          <MyAvatar size={36} shape="square" src={curCve.faceUrl} />
          <div style={{ fontWeight: 500 }} className="single_drawer_item_title">
            {curCve.showName}
          </div>
        </div>
        <RightOutlined />
      </div>
      {/* <div className="single_drawer_item">
        <div className="single_drawer_item_left">
          <TeamOutlined />
          <div className="single_drawer_item_title">创建群组</div>
        </div>
        <RightOutlined />
      </div> */}
      <div className="single_drawer_item">
        <div>{t("Pin")}</div>
        <Switch
          checked={curCve.isPinned === 0 ? false : true}
          size="small"
          onChange={updatePin}
        />
      </div>
      <div className="single_drawer_item">
        <div>{t("AddBlack")}</div>
        <Switch size="small" checked={info?.isInBlackList===1} onChange={(e)=>blackListChnage(e)} />
      </div>
      <div className="single_drawer_item">
        <div>{t("NotDisturb")}</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <Button onClick={delFriend} danger className="single_drawer_btn">
        {t("RemoveFriend")}
      </Button>
    </div>
  );
};

export default SingleDrawer;
