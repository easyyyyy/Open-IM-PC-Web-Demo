import { RightOutlined, TeamOutlined } from "@ant-design/icons";
import { Switch, Button } from "antd";
import { FC } from "react";
import { Cve } from "../../../../@types/open_im";
import { MyAvatar } from "../../../../components/MyAvatar";

type SingleDrawerProps = {
  curCve: Cve;
  openCard: () => void;
  updatePin: () => void;
  delFriend: () => void;
};

const SingleDrawer: FC<SingleDrawerProps> = ({
  curCve,
  openCard,
  updatePin,
  delFriend,
}) => {
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
        <div>添加到置顶</div>
        <Switch
          checked={curCve.isPinned === 0 ? false : true}
          size="small"
          onChange={updatePin}
        />
      </div>
      <div className="single_drawer_item">
        <div>添加到黑名单</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <div className="single_drawer_item">
        <div>消息免打扰</div>
        <Switch size="small" onChange={() => {}} />
      </div>
      <Button onClick={delFriend} danger className="single_drawer_btn">
        解除好友
      </Button>
    </div>
  );
};

export default SingleDrawer;
