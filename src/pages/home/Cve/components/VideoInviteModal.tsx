import { Modal } from "antd"
import { FC } from "react"
import { MyAvatar } from "../../../../components/MyAvatar";
import { Cve } from '../../../../@types/open_im'
import { UserOutlined } from "@ant-design/icons";

type VideoInviteModalProps = {
    cancle: () => void;
    visible: boolean;
    curCve?: Cve;
}

const VideoInviteModal:FC<VideoInviteModalProps> = ({cancle, visible, curCve}) => {
    const handerCancle = () => {
        cancle()
    }

    return (
        <Modal
        className="rtc_modal"
        width={'400px'}
        visible={visible}
        footer={null}
        closable={false}>
            <div className="rtc_body" style={{width:'400px',height:'300px'}}>
                <div className="body_actions" style={{justifyContent: "space-between"}}>
                    <div className="body_actions_tops">
                    <MyAvatar shape="square" size={42} src={curCve?.faceUrl} icon={<UserOutlined />} />
                        <div className="nickname">{curCve?.showName}</div>
                        <div>正在发起视频通话</div>
                    </div>
                    <div className="body_actions_bottom">
                        <div className="actions">
                            <div className="bottom_actions_item">
                                <img
                                className="rtc_action_icon"
                                src="data:image/png;base64,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"
                                alt=""
                                onClick={handerCancle}/>
                                <div>取消</div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </Modal>
    )
}

export default VideoInviteModal
