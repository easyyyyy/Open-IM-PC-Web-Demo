import { EllipsisOutlined } from "@ant-design/icons"
import { FC, useEffect, useState } from "react"
import { GroupItem, UserInfo } from "../../../../../@types/open_im"
import { MyAvatar } from "../../../../../components/MyAvatar"
import { im } from "../../../../../utils"

type GruopNoticeProps = {
    groupInfo?:GroupItem
}

export const GroupNotice:FC<GruopNoticeProps> = ({groupInfo}) => {
    const [ownerInfo,setOwnerInfo] = useState<UserInfo>();

    useEffect(()=>{
        if(groupInfo){
            im.getUsersInfo([groupInfo.ownerId]).then(res=>{
                setOwnerInfo(JSON.parse(res.data)[0])
            })
        }
    },[groupInfo])

    return (
        <div className="group_notice">
            <div className="group_notice_title">
                <div className="left">
                <MyAvatar src={ownerInfo?.icon} size={36}/>
                <div className="left_info">
                    <div>{ownerInfo?.name}</div>
                    <div>15:20</div>
                </div>
                </div>
                <EllipsisOutlined />
            </div>
            <div>{groupInfo?.notification}</div>
        </div>
    )
}
