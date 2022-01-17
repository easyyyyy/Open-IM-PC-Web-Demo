import { Layout } from "antd";
import { FC } from "react";
import { Outlet } from "react-router";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../store";
import ToolsBar from "./ToolsBar";
import { CloseOutlined, ExpandOutlined, MinusOutlined } from "@ant-design/icons";

type LayoutProps = {
  siderList?: JSX.Element;
  rightHeader?: JSX.Element;
  rightFooter?: JSX.Element;
  rightBar?: JSX.Element;
};

const Mylayout: FC<LayoutProps> = (props) => {
  const selectValue = (state: RootState) => state.user.selfInfo;
  const userInfo = useSelector(selectValue, shallowEqual);

  const miniSizeApp = () => {
    window.electron && window.electron.miniSizeApp();
  };

  const maxSizeApp = () => {
    window.electron && window.electron.maxSizeApp();
  };

  const closeApp = () => {
    window.electron && window.electron.closeApp();
  };

  const WindowsToolBar = () => (
    <div className="right_win_btn">
      <MinusOutlined onClick={miniSizeApp} />
      <ExpandOutlined onClick={maxSizeApp} />
      <CloseOutlined onClick={closeApp} />
    </div>
  );

  return (
    <Layout style={{ height: "100vh", maxHeight: "100vh" }}>
      {window.electron && !window.electron.isMac && <WindowsToolBar />}
      <ToolsBar userInfo={userInfo} />
      <Outlet />
    </Layout>
  );
};

export default Mylayout;
