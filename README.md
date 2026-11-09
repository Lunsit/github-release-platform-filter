# GitHub Release Platform Filter

一个优化 GitHub Releases 页面体验的油猴脚本。本仓库是基于
[eecopilot/github-release-platform-filter](https://github.com/eecopilot/github-release-platform-filter)
的 fork：修复暗色主题适配、重做筛选面板 UI，并跟进 GitHub 新版页面结构。

## 功能特点

- **明暗主题自适应**：界面全部改用 GitHub Primer 主题变量，自动跟随浅色 / 深色 / 深色暗淡 / 高对比度主题
- **全新筛选面板**：悬浮胶囊入口、平台品牌图标、各类别资源数量、已选类别角标
- **平台 + 架构二级筛选**：选中平台后展开该平台的架构芯片（x64 / ARM64 / x86 / Universal 等），可多选继续收窄
- **其他与源码独立分类**：不属于任何平台的资源归入「其他」，Source code 单独成「源码」一栏，均可独立筛选
- **按平台筛选**：Windows / macOS / Linux / Android；校验和、源码包等通用文件不再强制显示
- **快捷操作**：「保存为偏好」写入当前选择，「显示全部」恢复完整列表
- **发布说明折叠**：超过 300px 自动折叠，底部显示独立的圆形下箭头，点击展开 / 收起
- **偏好保存**：点击「保存为偏好」后，平台、架构与类别选择通过 `GM_setValue` 持久化，下次访问自动应用
- **可访问性**：键盘操作、Esc 关闭、焦点环，尊重 `prefers-reduced-motion`
- **跟进新版 GitHub**：兼容 `markdown-body tmp-my-3` 类名、`include-fragment` 懒加载资源列表

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. [点击安装脚本](https://raw.githubusercontent.com/Lunsit/github-release-platform-filter/main/github-release-platform-filter.user.js)

脚本的 `@updateURL` 指向本仓库，安装后会跟随本仓库更新。

## 使用说明

打开任意仓库的 Releases 页面（`/releases` 或 `/releases/tag/...`）：

- 页面右侧会出现漏斗图标，角标数字表示已选类别数量，悬停可展开「筛选」文字
- 点击图标打开面板，勾选类别即时筛选；每项右侧数字为当前已加载资源中该类别的数量
- 选中平台后会展开该平台的架构芯片（如 Windows 的 x64 / ARM64 / x86），点击芯片可多选架构；「全部」清除该平台的架构限制
- 不属于任何平台的资源归入「其他」，Source code 单独列为「源码」，两者都能独立勾选
- 调整后会即时生效但不写入偏好，点击「保存为偏好」后才持久化；「显示全部」恢复完整列表
- 发布说明超过 300px 时底部显示圆形下箭头，点击展开，再点收起

> 资源列表受 GitHub 懒加载影响时会显示「资源加载中…」或「已加载」。在页面中点击
> “Show all … assets” 加载全部资源后，面板统计与筛选结果会自动更新。

## 与上游的差异

- 用 Primer 主题变量替换全部硬编码浅色，修复暗色模式
- 重做悬浮筛选面板与发布说明折叠 UI
- 新增平台下的架构二级筛选与「保存为偏好」显式保存
- 新增「其他」「源码」独立分类，Source code 单独成栏
- 发布说明折叠改为独立的圆形下箭头，面板标题统一为「筛选」
- 修复 GitHub 新类名 `tmp-my-3` 导致的长文折叠失效
- 适配 `include-fragment` 的 `src` / `data-deferred-src` 两种懒加载写法
- 修正资源识别：Arch 的 `*.pkg.tar.zst` 不再误判为 macOS，`x86_64` 不再重复计入 x86，匹配只取文件名并支持更多扩展名
- 修复动态加载后不重新筛选、监听器重复注册、内联样式覆盖等问题

## 许可证

MIT License
