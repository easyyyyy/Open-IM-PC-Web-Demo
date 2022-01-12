import { FC } from "react";
import { FriendItem, GroupItem } from "../../../@types/open_im";
import ContactList from "../../../components/ContactList";
import { SessionType } from "../../../constants/messageContentType";
import { MenuItem } from "./ContactMenuList";
import GroupList from "./GroupList";
import NewNotice from "./NewNotice";

type ContactContentProps = {
  menu: MenuItem;
  contactList: FriendItem[];
  clickItem: (item:FriendItem | GroupItem,type:SessionType)=>void
};

export const ContactContent: FC<ContactContentProps> = (props) => {


  const switchContent = () => {
    switch (props.menu.idx) {
      case 1:
      case 2:
        return <NewNotice type={props.menu.idx} />;
      case 0:
      case 3:
        return <ContactList {...props} />;
      case 4:
        return <GroupList clickItem={props.clickItem} />;
      default:
        return null;
    }
  };
  return switchContent();
};
