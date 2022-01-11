import { Layout } from "antd";
import { useState } from "react";
import HomeSider from "../components/HomeSider";
import ContactMenuList, { MenuItem } from "./ContactMenuList";
import my_friend from "@/assets/images/my_friend.png";
import my_group from "@/assets/images/my_group.png";
import new_friend from "@/assets/images/new_friend.png";
import new_group from "@/assets/images/new_group.png";
import nomal_cons from "@/assets/images/nomal_cons.png";
import { RootState } from "../../../store";
import { shallowEqual, useSelector } from "react-redux";
import HomeHeader from "../components/HomeHeader";
import { ContactContent } from "./ContactContent";
import { FriendItem, GroupItem } from "../../../@types/open_im";
import { sessionType } from "../../../constants/messageContentType";
import { events } from "../../../utils";
import { TOASSIGNCVE } from "../../../constants/events";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

const Contacts = () => {
  const { t } = useTranslation();
  const consMenuList = [
    {
      title: t("CommonContacts"),
      icon: nomal_cons,
      bgc: "#FEC757",
      idx: 0,
      suffix: "nc",
    },
    {
      title: t("NewFriend"),
      icon: new_friend,
      bgc: "#428BE5",
      idx: 1,
      suffix: "nf",
    },
    {
      title: t("NewGroups"),
      icon: new_group,
      bgc: "#428BE5",
      idx: 2,
      suffix: "ng",
    },
    {
      title: t("MyFriends"),
      icon: my_friend,
      bgc: "#428BE5",
      idx: 3,
      suffix: "mf",
    },
    {
      title: t("MyGroups"),
      icon: my_group,
      bgc: "#53D39C",
      idx: 4,
      suffix: "mg",
    },
  ];
  const [menu, setMenu] = useState(consMenuList[3]);
  const selectValue = (state: RootState) => state.contacts.friendList;
  const cons = useSelector(selectValue, shallowEqual);
  const navigate = useNavigate()

  const clickMenuItem = (item: MenuItem) => {
    setMenu(item)
  };

  const clickListItem = (item:FriendItem|GroupItem,type:sessionType) => {
    navigate('/')
    setTimeout(()=>{
      events.emit(TOASSIGNCVE,type===sessionType.SINGLECVE?(item as FriendItem).uid:(item as GroupItem).groupID,type)
    },0)
  }

  return (
    <>
      <HomeSider searchCb={()=>{}}>
        <ContactMenuList
          curTab={menu.title}
          menusClick={clickMenuItem}
          menus={consMenuList}
        />
      </HomeSider>
      <Layout>
        <HomeHeader title={menu.title} isShowBt={menu.idx !== 3 && menu.idx !== 0} type="contact" />
        <Content className="total_content">
          <ContactContent clickItem={clickListItem} contactList={cons!} menu={menu} />
        </Content>
      </Layout>
    </>
  );
};

export default Contacts;
