import { UserOutlined } from "@ant-design/icons";
import { Anchor, Avatar, Empty } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FriendItem } from "../../@types/open_im";
import { SessionType } from "../../constants/messageContentType";
import { pySegSort } from "../../utils/common";
import { MyAvatar } from "../MyAvatar";
import styles from "./contact.module.less";

const { Link } = Anchor;

type ConSectionProps = {
  section: string;
  items: FriendItem[];
  clickItem: (item:FriendItem,type:SessionType)=>void
};

type SectionItemProps = {
  item: FriendItem;
  clickItem: (item:FriendItem,type:SessionType)=>void
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
  <div onDoubleClick={()=>props.clickItem(props.item,SessionType.SINGLECVE)} className={styles.cons_section_item}>
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
  clickItem: (item:FriendItem,type:SessionType)=>void
};

type Cons = {
  data: FriendItem[];
  initial: string;
};

const ContactList: FC<ContactListProps> = ({ contactList,clickItem }) => {
  const [sections, setSections] = useState<Array<string>>([]);
  const [cons, setCons] = useState<Cons[]>();
  const { t } = useTranslation();

  useEffect(() => {
    if (contactList.length > 0) {
      const sortData: Cons[] = pySegSort(contactList).segs;
      setSections(sortData.map((sec) => sec.initial));
      setCons(sortData);
    }
  }, [contactList]);

  const clickAuthor = (id:string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  const ListView = () => (
    <>
      {cons?.map((con) => (
        <ConSection clickItem={clickItem} key={con.initial} section={con.initial} items={con.data} />
      ))}
      <div className={styles.right_index}>
        <div className={styles.right_con}>
          {sections.map((s, idx) => (
            <div onClick={()=>clickAuthor(s)} key={idx} title={s} id={`con${s}`}>{s}</div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.cons_box}>
      {contactList.length > 0 ? (
        <ListView />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("NoData")} />
      )}
    </div>
  );
};

export default ContactList;
