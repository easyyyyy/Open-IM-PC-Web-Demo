import { Empty, List } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual, useSelector } from "react-redux";
import { Cve } from "../../../../@types/open_im";
import { RootState } from "../../../../store";
import CveItem from "./CveItem";



type CveListProps = {
  cveList: Cve[];
  clickItem: (cve: Cve) => void;
  loading: boolean;
  marginTop?: number;
  curCve: Cve | null;
};

const CveList: FC<CveListProps> = ({ cveList, clickItem, loading, marginTop, curCve }) => {
  const curUid = useSelector((state: RootState) => state.user.selfInfo.uid, shallowEqual);
  const { t } = useTranslation();
  
  return (
    <div className="cve_list">
      {cveList.length > 0 ? (
        <List
          className="cve_list_scroll"
          style={{ height: `calc(100vh - ${marginTop}px)` }}
          itemLayout="horizontal"
          dataSource={cveList}
          split={false}
          loading={loading}
          renderItem={(item,idx) => <CveItem idx={idx} cveList={cveList} curUid={curUid!} curCve={curCve} key={item.conversationID} onClick={clickItem} cve={item} />}
        />
      ) : (
        <Empty description={t("NoCve")} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

CveList.defaultProps = {
  marginTop: 58,
};

export default CveList;
