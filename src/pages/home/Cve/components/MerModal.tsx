import { Modal } from "antd"
import { FC } from "react"
import { Cve } from "../../../../@types/open_im"
import { MergeElem, PictureElem } from "../../../../utils/open_im_sdk/im"
import ChatContent from "../ChatContent"
import MsgItem from "./MsgItem"

type MerModalProps = {
    close:()=>void;
    imgClick: (el: PictureElem) => void;
    info:MergeElem & {sender:string};
    visible: boolean
}

const MerModal:FC<MerModalProps> = ({close,imgClick,info,visible}) => {
    return (
        <Modal
        title={info?.title}
        visible={visible}
        footer={null}
        onCancel={close}
        getContainer={false}
        mask={false}
        width="60vw"
        className="mer_modal"
        >
        <ChatContent
              loadMore={()=>{}}
              loading={false}
              msgList={info!.multiMessage}
              imgClick={imgClick}
              hasMore={false}
            />
        </Modal>
    )
}

export default MerModal
