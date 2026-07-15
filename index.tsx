import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TimeProvider } from './contexts/TimeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 保留启动占位层，等 React 完成首帧后再平滑淡出（避免直接替换造成视觉跳变）
const bootSplash = document.getElementById('boot-splash');
if (bootSplash && bootSplash.parentElement === rootElement) {
  // 将占位层挂到 body，使 React 渲染 #root 时不会立即删除它
  document.body.appendChild(bootSplash);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TimeProvider>
      <App />
    </TimeProvider>
  </React.StrictMode>
);

// React 完成首次渲染后再淡出
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('boot-splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      setTimeout(() => splash.remove(), 400);
    }
  });
});
