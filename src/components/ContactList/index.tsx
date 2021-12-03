import { UserOutlined } from "@ant-design/icons";
import { Anchor, Avatar, Empty } from "antd";
import { FC, useEffect, useState } from "react";
import { FriendItem } from "../../@types/open_im";
import { sessionType } from "../../constants/messageContentType";
import { pySegSort } from "../../utils/objUtl";
import { MyAvatar } from "../MyAvatar";
import styles from "./contact.module.less";

const { Link } = Anchor;

type ConSectionProps = {
  section: string;
  items: FriendItem[];
  clickItem: (item:FriendItem,type:sessionType)=>void
};

type SectionItemProps = {
  item: FriendItem;
  clickItem: (item:FriendItem,type:sessionType)=>void
};

const ConSection: FC<ConSectionProps> = (props) => (
  <div id={props.section} className={styles.cons_section}>
    <div className={styles.cons_section_title}>{props.section}</div>
    <div className={styles.cons_section_divider} />
    {props.items.map((i, idx) => (
      <SectionItemComp clickItem={props.clickItem} key={i.uid} item={i} />
    ))}
  </div>
);

const SectionItemComp: FC<SectionItemProps> = (props) => (
  <div onDoubleClick={()=>props.clickItem(props.item,sessionType.SINGLECVE)} className={styles.cons_section_item}>
    <MyAvatar
      shape="square"
      size={36}
      src={props.item.icon}
      icon={<UserOutlined />}
    />
    <div className={styles.cons_item_desc}>{props.item.name}</div>
  </div>
);

type ContactListProps = {
  contactList: FriendItem[];
  clickItem: (item:FriendItem,type:sessionType)=>void
};

type Cons = {
  data: FriendItem[];
  initial: string;
};

const ContactList: FC<ContactListProps> = ({ contactList,clickItem }) => {
  const [sections, setSections] = useState<Array<string>>([]);
  const [cons, setCons] = useState<Cons[]>();

  useEffect(() => {
    if (contactList.length > 0) {
      const sortData: Cons[] = pySegSort(contactList).segs;
      setSections(sortData.map((sec) => sec.initial));
      setCons(sortData);
    }
  }, [contactList]);

  const ListView = () => (
    <>
      {cons?.map((con) => (
        <ConSection clickItem={clickItem} key={con.initial} section={con.initial} items={con.data} />
      ))}
      <div className={styles.right_index}>
        <Anchor>
          {sections.map((s, idx) => (
            <Link key={idx} title={s} href={`#${s}`} />
          ))}
        </Anchor>
      </div>
    </>
  );

  return (
    <div className={styles.cons_box}>
      {contactList.length > 0 ? (
        <ListView />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      )}
    </div>
  );
};

export default ContactList;
