import { UserOutlined, UserAddOutlined, AudioOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { FC } from "react";
import { Cve } from "../../../@types/open_im";
import { MyAvatar } from "../../../components/MyAvatar";
const { Header } = Layout;

type HeaderProps = {
  isShowBt?: boolean;
  type: "chat" | "contact";
  title?: string;
  curCve?: Cve
  typing?:boolean
};

const HomeHeader: FC<HeaderProps> = ({ isShowBt, type,title,curCve,typing }) => {

  return (
    <Header
      className="chat_header"
      style={{ borderBottom: isShowBt ? "1px solid #dedfe0" : "none" }}
    >
      {type === "chat" ? (
        <div className="chat_header_box">
          <div className="chat_header_box_left">
            <MyAvatar shape="square" size={42} src={curCve?.faceUrl} icon={<UserOutlined/>} />
            <div attr-data={typing?'正在输入...':''} className="cur_cve_info">
            <span>{curCve?.showName}</span>
            </div>
          </div>
          <div className="chat_header_box_right">
            <AudioOutlined />
            <PlayCircleOutlined />
            <UserAddOutlined />
          </div>
          
        </div>
      ) : (
        <div className="chat_header_box">{title}</div>
      )}
    </Header>
  );
};

HomeHeader.defaultProps = {
  isShowBt: true,
};

export default HomeHeader;
