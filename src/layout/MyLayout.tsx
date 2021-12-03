import { Layout } from "antd";
import { FC } from "react";
import { Outlet } from "react-router";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store";
import ToolsBar from "./ToolsBar";

type LayoutProps = {
  siderList?: JSX.Element;
  rightHeader?: JSX.Element;
  rightFooter?: JSX.Element;
  rightBar?: JSX.Element;
};

const Mylayout: FC<LayoutProps> = (props) => {
  const selectValue = (state: RootState) => state.user.selfInfo;
  const userInfo = useSelector(selectValue, shallowEqual);
  
  return (
    <Layout style={{ height: "100vh",maxHeight:"100vh" }}>
      <ToolsBar userInfo={userInfo} />
      <Outlet />
    </Layout>
  );
};

export default Mylayout;
