import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './index.css';
import App from './pages/App';

ReactDOM.render(
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>,
  document.getElementById('root')
);
