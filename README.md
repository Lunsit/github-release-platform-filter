# GitHub Release Platform Filter

一个优化 GitHub Releases 页面体验的油猴脚本。本仓库是基于
[eecopilot/github-release-platform-filter](https://github.com/eecopilot/github-release-platform-filter)
的 fork：修复暗色主题适配、重做筛选面板 UI，并跟进 GitHub 新版页面结构。

## 功能特点

- 🌗 **明暗主题自适应**：界面全部改用 GitHub Primer 主题变量，自动跟随浅色 / 深色 / 深色暗淡 / 高对比度主题
- 🎨 **全新筛选面板**：悬浮胶囊入口、平台品牌图标、各平台资源数量、已选平台角标
- 🔍 **按平台筛选**：Windows / macOS / Linux / Android；校验和、源码包等通用文件始终显示
- ⚡ **快捷操作**：「仅当前平台」「显示全部」一键切换
- 📝 **发布说明折叠**：超过 300px 自动折叠，渐隐遮罩与胶囊按钮同样适配明暗主题
- 💾 **记住偏好**：平台选择通过 `GM_setValue` 持久化
- ⌨️ **可访问性**：键盘操作、Esc 关闭、焦点环，尊重 `prefers-reduced-motion`
- 🧩 **跟进新版 GitHub**：兼容 `markdown-body tmp-my-3` 类名、`include-fragment` 懒加载资源列表

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. [点击安装脚本](https://raw.githubusercontent.com/Lunsit/github-release-platform-filter/main/github-release-platform-filter.user.js)

脚本的 `@updateURL` 指向本仓库，安装后会跟随本仓库更新。

## 使用说明

打开任意仓库的 Releases 页面（`/releases` 或 `/releases/tag/...`）：

- 页面右侧会出现漏斗图标，角标数字表示已选平台数量，悬停可展开「平台筛选」文字
- 点击图标打开面板，勾选平台即时筛选；每项右侧数字为当前已加载资源中该平台的数量
- 「仅当前平台」快速只看本机平台，「显示全部」恢复完整列表
- 发布说明超过 300px 时底部显示「展开更多」，展开后变为「收起」

> 资源列表受 GitHub 懒加载影响时会显示「资源加载中…」或「已加载」。在页面中点击
> “Show all … assets” 加载全部资源后，面板统计与筛选结果会自动更新。

## 与上游的差异

- 用 Primer 主题变量替换全部硬编码浅色，修复暗色模式
- 重做悬浮筛选面板与发布说明折叠 UI
- 修复 GitHub 新类名 `tmp-my-3` 导致的长文折叠失效
- 适配 `include-fragment` 的 `src` / `data-deferred-src` 两种懒加载写法
- 修正资源识别：Arch 的 `*.pkg.tar.zst` 不再误判为 macOS，匹配只取文件名并支持更多扩展名
- 修复动态加载后不重新筛选、监听器重复注册、内联样式覆盖等问题

## 许可证

MIT License
