// ==UserScript==
// @name         GitHub发布平台筛选器
// @name:en      GitHub Release Platform Filter
// @namespace    https://github.com/eecopilot
// @version      0.4.3
// @description  按平台、架构与类别筛选GitHub发布资源，优化发布说明显示，适配明暗主题
// @description:en  Filter GitHub release assets by platform, architecture and category, collapse long release notes, with light/dark theme support
// @author       EEP
// @contributor  Lunsit
// @match        https://github.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @homepage     https://github.com/Lunsit/github-release-platform-filter
// @supportURL   https://github.com/Lunsit/github-release-platform-filter/issues
// @downloadURL  https://raw.githubusercontent.com/Lunsit/github-release-platform-filter/main/github-release-platform-filter.user.js
// @updateURL    https://raw.githubusercontent.com/Lunsit/github-release-platform-filter/main/github-release-platform-filter.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'selectedPlatforms';
  const ARCH_STORAGE_KEY = 'selectedArchitectures';
  const TYPE_STORAGE_KEY = 'selectedPackageTypes';
  const ORDER_STORAGE_KEY = 'platformOrder';
  const FILTER_SCHEMA_KEY = 'filterSchemaVersion';
  const FILTER_SCHEMA_VERSION = 1;
  const COLLAPSE_LIMIT = 300;
  const ASSET_ROW_SELECTOR =
    '.Box--condensed .Box-row.d-flex.flex-column.flex-md-row';
  const RELEASE_BODY_SELECTOR =
    '.markdown-body.my-3, .markdown-body.tmp-my-3, [data-test-selector="body-content"].markdown-body';

  const ICONS = {
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5h17l-6.6 7.6V20l-3.8-2.1v-5.3L3.5 5Z"/></svg>`,
    windows: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M6.555 1.375 0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4.026 6.378L16 16V8.395zM16 0 7.33 1.244v6.414H16z"/></svg>`,
    apple: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`,
    linux: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"/></svg>`,
    android: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2.76 3.061a.5.5 0 0 1 .679.2l1.283 2.352A8.9 8.9 0 0 1 8 5a8.9 8.9 0 0 1 3.278.613l1.283-2.352a.5.5 0 1 1 .878.478l-1.252 2.295C14.475 7.266 16 9.477 16 12H0c0-2.523 1.525-4.734 3.813-5.966L2.56 3.74a.5.5 0 0 1 .2-.678ZM5 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>`,
    check: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L3.22 8.28a.75.75 0 0 1 1.06-1.06l2.72 2.72 5.72-5.72a.75.75 0 0 1 1.06 0Z"/></svg>`,
    chevronDown: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.78 5.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.28a.75.75 0 0 1 1.06-1.06L8 8.94l3.72-3.72a.75.75 0 0 1 1.06 0Z"/></svg>`,
    chevronUp: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.22 10.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1-1.06 1.06L8 7.06l-3.72 3.72a.75.75 0 0 1-1.06 0Z"/></svg>`,
    ellipsis: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>`,
    code: `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L13.94 8 10.22 4.28a.75.75 0 0 1 1.06-1.06Zm-5.5 0a.75.75 0 0 1 0 1.06L2.06 8l3.72 3.72a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042-.018L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"/></svg>`,
  };

  const PLATFORMS = [
    {
      id: 'windows',
      name: 'Windows',
      icon: ICONS.windows,
      pattern:
        /\.(?:exe|msi|msix|appx)\b|(?:^|[-_.\s])win(?:32|64|dows)?(?:[-_.\s]|$)/i,
    },
    {
      id: 'macos',
      name: 'macOS',
      icon: ICONS.apple,
      pattern:
        /\.(?:dmg|pkg)(?![.\w])|(?:^|[-_.\s])(?:darwin|macos|osx|mac)(?:[-_.\s]|$)|mac(?:os)?[ -]?(?:arm64|x64|universal)/i,
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: ICONS.linux,
      pattern:
        /\.(?:deb|rpm|appimage|flatpak|snap)\b|(?:^|[-_.\s])(?:linux|ubuntu|debian|fedora|freebsd|arch)(?:[-_.\s]|$)/i,
    },
    {
      id: 'android',
      name: 'Android',
      icon: ICONS.android,
      pattern: /\.(?:apk|aab|apks)\b|(?:^|[-_.\s])android(?:[-_.\s]|$)/i,
    },
  ];
  const PLATFORM_IDS = PLATFORMS.map((platform) => platform.id);

  const ARCHITECTURES = {
    windows: [
      {
        id: 'x64',
        name: 'x64',
        pattern: /(?:^|[-_.\s])(?:x86_64|amd64|x64|win64)(?=$|[-_.\s])/i,
      },
      {
        id: 'arm64',
        name: 'ARM64',
        pattern: /(?:^|[-_.\s])(?:arm64|aarch64)(?=$|[-_.\s])/i,
      },
      {
        id: 'x86',
        name: 'x86',
        pattern:
          /(?:^|[-_.\s])(?:x86(?![-_.]?64)|i[3-6]86|ia32)(?=$|[-_.\s])/i,
      },
    ],
    macos: [
      {
        id: 'arm64',
        name: 'Apple Silicon',
        pattern:
          /(?:^|[-_.\s])(?:arm64|aarch64|apple[-_.]?silicon|silicon)(?=$|[-_.\s])/i,
      },
      {
        id: 'x64',
        name: 'Intel',
        pattern: /(?:^|[-_.\s])(?:x86_64|amd64|x64|intel)(?=$|[-_.\s])/i,
      },
      {
        id: 'universal',
        name: 'Universal',
        pattern: /(?:^|[-_.\s])(?:universal|fat)(?=$|[-_.\s])/i,
      },
    ],
    linux: [
      {
        id: 'x64',
        name: 'x86_64',
        pattern: /(?:^|[-_.\s])(?:x86_64|amd64|x64)(?=$|[-_.\s])/i,
      },
      {
        id: 'arm64',
        name: 'ARM64',
        pattern: /(?:^|[-_.\s])(?:arm64|aarch64)(?=$|[-_.\s])/i,
      },
      {
        id: 'x86',
        name: 'x86',
        pattern:
          /(?:^|[-_.\s])(?:x86(?![-_.]?64)|i[3-6]86|386)(?=$|[-_.\s])/i,
      },
      {
        id: 'arm',
        name: 'ARM',
        pattern:
          /(?:^|[-_.\s])(?:armv[5-8]\w*|armhf|armel|arm)(?=$|[-_.\s])/i,
      },
      {
        id: 'riscv64',
        name: 'RISC-V',
        pattern: /(?:^|[-_.\s])riscv64(?=$|[-_.\s])/i,
      },
      {
        id: 'ppc64le',
        name: 'PPC64LE',
        pattern: /(?:^|[-_.\s])ppc64le(?=$|[-_.\s])/i,
      },
      {
        id: 's390x',
        name: 's390x',
        pattern: /(?:^|[-_.\s])s390x(?=$|[-_.\s])/i,
      },
    ],
    android: [
      {
        id: 'arm64',
        name: 'arm64-v8a',
        pattern:
          /(?:^|[-_.\s])(?:arm64[-_.]?v8a|arm64|aarch64)(?=$|[-_.\s])/i,
      },
      {
        id: 'arm',
        name: 'armeabi-v7a',
        pattern:
          /(?:^|[-_.\s])(?:armeabi[-_.]?v7a|armeabi|armv7\w*)(?=$|[-_.\s])/i,
      },
      {
        id: 'x86_64',
        name: 'x86_64',
        pattern: /(?:^|[-_.\s])(?:x86_64|x64)(?=$|[-_.\s])/i,
      },
      {
        id: 'x86',
        name: 'x86',
        pattern:
          /(?:^|[-_.\s])(?:x86(?![-_.]?64)|i[3-6]86|386)(?=$|[-_.\s])/i,
      },
      {
        id: 'universal',
        name: '通用',
        pattern: /(?:^|[-_.\s])(?:universal|all)(?=$|[-_.\s])/i,
      },
    ],
  };

  const EXTRA_CATEGORIES = [
    { id: 'other', name: '其他', icon: ICONS.ellipsis },
    { id: 'source', name: '源码', icon: ICONS.code },
  ];
  const CATEGORIES = PLATFORMS.concat(EXTRA_CATEGORIES);
  const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

  const PACKAGE_TYPES = [
    {
      id: 'installer',
      name: '安装包',
      pattern:
        /\.(?:exe|msi|msix|appx|dmg|pkg|mpkg|deb|rpm|apk|aab|apks|flatpak|snap)(?=[._]|$)|(?:^|[-_.\s])(?:setup|installer)(?=$|[-_.\s])/i,
    },
    {
      id: 'portable',
      name: '便携版',
      pattern:
        /(?:^|[-_.\s])(?:portable|standalone|no[-_.]?install)(?=$|[-_.\s])|\.appimage(?=[._]|$)/i,
    },
  ];
  const PACKAGE_TYPE_IDS = PACKAGE_TYPES.map((type) => type.id);

  const STYLES = `
    :root {
      --grpf-bg: var(--bgColor-default, #ffffff);
      --grpf-bg-muted: var(--bgColor-muted, #f6f8fa);
      --grpf-fg: var(--fgColor-default, #1f2328);
      --grpf-fg-muted: var(--fgColor-muted, #59636e);
      --grpf-accent: var(--fgColor-accent, #0969da);
      --grpf-accent-bg: var(--bgColor-accent-muted, #ddf4ff);
      --grpf-border: var(--borderColor-default, #d1d9e0);
      --grpf-border-muted: var(--borderColor-muted, #d1d9e0b3);
      --grpf-on-accent: var(--fgColor-onEmphasis, #ffffff);
      --grpf-shadow: var(--shadow-floating-small, 0 0 0 1px rgba(31, 35, 40, 0.08), 0 8px 24px rgba(140, 149, 159, 0.2));
    }

    .platform-filter {
      position: fixed;
      top: 76px;
      right: 0;
      z-index: 95;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: var(--fontStack-system, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif);
      font-size: 14px;
      line-height: 1.5;
      color: var(--grpf-fg);
    }

    .platform-filter *,
    .platform-filter *::before,
    .platform-filter *::after {
      box-sizing: border-box;
    }

    .platform-filter-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 40px;
      height: 40px;
      margin: 0;
      padding: 0 10px;
      border: 1px solid var(--grpf-border);
      border-right: 0;
      border-radius: 10px 0 0 10px;
      background: var(--grpf-bg);
      color: var(--grpf-fg-muted);
      box-shadow: var(--grpf-shadow);
      font: inherit;
      cursor: pointer;
      user-select: none;
      transition: color 0.15s ease, background-color 0.15s ease;
    }

    .platform-filter-button:hover,
    .platform-filter-button[aria-expanded="true"] {
      background: var(--grpf-bg-muted);
      color: var(--grpf-fg);
    }

    .platform-filter[data-filtering="true"] .platform-filter-button {
      color: var(--grpf-accent);
    }

    .platform-filter-button svg {
      width: 18px;
      height: 18px;
      flex: none;
    }

    .platform-filter-label {
      max-width: 0;
      overflow: hidden;
      opacity: 0;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
      transition: max-width 0.2s ease, opacity 0.2s ease;
    }

    .platform-filter:hover .platform-filter-label,
    .platform-filter:focus-within .platform-filter-label,
    .platform-filter .platform-filter-button[aria-expanded="true"] .platform-filter-label {
      max-width: 80px;
      opacity: 1;
    }

    .platform-filter-badge {
      position: absolute;
      top: -6px;
      left: -6px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--grpf-accent);
      color: var(--grpf-on-accent);
      font-size: 10px;
      font-weight: 700;
      line-height: 16px;
      text-align: center;
      box-shadow: 0 0 0 2px var(--grpf-bg);
    }

    .platform-filter-badge[hidden] {
      display: none;
    }

    .platform-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 12px;
      width: 280px;
      max-height: calc(100vh - 140px);
      overflow-y: auto;
      padding: 8px;
      border: 1px solid var(--grpf-border);
      border-radius: 12px;
      background: var(--grpf-bg);
      box-shadow: var(--grpf-shadow);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-4px) scale(0.98);
      transform-origin: top right;
      pointer-events: none;
      transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
    }

    .platform-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: none;
      pointer-events: auto;
    }

    .platform-dropdown-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      padding: 6px 8px 8px;
    }

    .platform-dropdown-title {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--grpf-fg);
    }

    .platform-dropdown-summary {
      font-size: 12px;
      color: var(--grpf-fg-muted);
      font-variant-numeric: tabular-nums;
    }

    .platform-options {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .platform-row {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .platform-option {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
      width: auto;
      margin: 0;
      padding: 7px 8px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--grpf-fg);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.12s ease;
    }

    .platform-option:hover {
      background: var(--grpf-bg-muted);
    }

    .platform-option.selected {
      background: var(--grpf-accent-bg);
    }

    .platform-option-icon {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      flex: none;
      border-radius: 8px;
      background: var(--grpf-bg-muted);
      color: var(--grpf-fg-muted);
      transition: background-color 0.12s ease, color 0.12s ease;
    }

    .platform-option.selected .platform-option-icon {
      background: var(--grpf-accent);
      color: var(--grpf-on-accent);
    }

    .platform-option-icon svg {
      width: 15px;
      height: 15px;
    }

    .platform-option-name {
      flex: 1;
      min-width: 0;
      font-size: 14px;
    }

    .platform-option-count {
      font-size: 12px;
      color: var(--grpf-fg-muted);
      font-variant-numeric: tabular-nums;
    }

    .platform-option.selected .platform-option-count {
      color: var(--grpf-accent);
    }

    .platform-option-check {
      display: grid;
      place-items: center;
      width: 16px;
      height: 16px;
      flex: none;
      border: 1px solid var(--grpf-border);
      border-radius: 4px;
      background: var(--grpf-bg);
      color: transparent;
    }

    .platform-option.selected .platform-option-check {
      border-color: var(--grpf-accent);
      background: var(--grpf-accent);
      color: var(--grpf-on-accent);
    }

    .platform-option-check svg {
      width: 12px;
      height: 12px;
    }

    .platform-move {
      display: none;
      gap: 2px;
      padding-right: 4px;
    }

    .platform-filter[data-reorder="true"] .platform-move {
      display: flex;
    }

    .move-button {
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      margin: 0;
      padding: 0;
      border: 1px solid var(--grpf-border);
      border-radius: 5px;
      background: var(--grpf-bg);
      color: var(--grpf-fg-muted);
      cursor: pointer;
      transition: background-color 0.12s ease, color 0.12s ease;
    }

    .move-button:hover:not(:disabled) {
      background: var(--grpf-bg-muted);
      color: var(--grpf-fg);
    }

    .move-button:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .move-button svg {
      width: 12px;
      height: 12px;
    }

    .move-button:focus-visible {
      outline: 2px solid var(--grpf-accent);
      outline-offset: 1px;
    }

    .platform-entry {
      display: flex;
      flex-direction: column;
    }

    .platform-arches {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.18s ease;
    }

    .platform-entry.selected .platform-arches {
      grid-template-rows: 1fr;
    }

    .platform-entry:not(.selected) .platform-arches {
      visibility: hidden;
    }

    .platform-arches[hidden] {
      display: none;
    }

    .platform-arches-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      overflow: hidden;
      padding: 0 8px 0 46px;
      transition: padding-bottom 0.18s ease;
    }

    .platform-entry.selected .platform-arches-inner {
      padding-bottom: 7px;
    }

    .arch-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      padding: 2px 8px;
      border: 1px solid var(--grpf-border);
      border-radius: 999px;
      background: var(--grpf-bg);
      color: var(--grpf-fg-muted);
      font: inherit;
      font-size: 11px;
      line-height: 16px;
      cursor: pointer;
      transition: background-color 0.12s ease, border-color 0.12s ease,
        color 0.12s ease;
    }

    .arch-chip:hover {
      background: var(--grpf-bg-muted);
    }

    .arch-chip.selected {
      border-color: var(--grpf-accent);
      background: var(--grpf-accent-bg);
      color: var(--grpf-accent);
      font-weight: 600;
    }

    .arch-chip[hidden] {
      display: none;
    }

    .arch-chip-count {
      font-size: 10px;
      font-variant-numeric: tabular-nums;
      opacity: 0.75;
    }

    .arch-chip:focus-visible {
      outline: 2px solid var(--grpf-accent);
      outline-offset: 1px;
    }

    .chips-break {
      flex-basis: 100%;
      height: 0;
    }

    .platform-action.saved,
    .platform-action.active {
      border-color: var(--grpf-accent);
      background: var(--grpf-accent-bg);
      color: var(--grpf-accent);
    }

    .platform-dropdown-footer {
      display: flex;
      gap: 6px;
      margin-top: 6px;
      padding: 8px 2px 2px;
      border-top: 1px solid var(--grpf-border-muted);
    }

    .platform-action {
      flex: 1;
      margin: 0;
      padding: 5px 8px;
      border: 1px solid var(--grpf-border);
      border-radius: 6px;
      background: var(--grpf-bg);
      color: var(--grpf-fg);
      font: inherit;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      cursor: pointer;
      transition: background-color 0.12s ease, border-color 0.12s ease;
    }

    .platform-action:hover:not(:disabled) {
      background: var(--grpf-bg-muted);
      border-color: var(--grpf-fg-muted);
    }

    .platform-action:disabled {
      color: var(--grpf-fg-muted);
      opacity: 0.6;
      cursor: not-allowed;
    }

    .platform-filter-button:focus-visible,
    .platform-action:focus-visible {
      outline: 2px solid var(--grpf-accent);
      outline-offset: 2px;
    }

    .platform-option:focus-visible {
      outline: 2px solid var(--grpf-accent);
      outline-offset: -2px;
    }

    .markdown-body.my-3.grpf-collapsible,
    .markdown-body.tmp-my-3.grpf-collapsible,
    [data-test-selector="body-content"].markdown-body.grpf-collapsible {
      position: relative;
      max-height: ${COLLAPSE_LIMIT}px;
      overflow: hidden;
      padding-bottom: 44px;
      transition: max-height 0.3s ease-in-out;
    }

    .markdown-body.grpf-collapsible.expanded {
      max-height: none;
      padding-bottom: 0;
    }

    .toggle-button {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 56px;
      width: 100%;
      margin: 0;
      padding: 0 0 9px;
      border: 0;
      background: linear-gradient(to top, var(--grpf-bg) 42%, transparent);
      font: inherit;
      cursor: pointer;
    }

    .markdown-body.grpf-collapsible.expanded .toggle-button {
      position: static;
      height: auto;
      padding: 10px 0 2px;
      background: none;
    }

    .toggle-icon {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border: 1px solid var(--grpf-border);
      border-radius: 50%;
      background: var(--grpf-bg);
      color: var(--grpf-fg-muted);
      box-shadow: var(--grpf-shadow);
      transition: background-color 0.12s ease, color 0.12s ease;
    }

    .toggle-button:hover .toggle-icon {
      background: var(--grpf-bg-muted);
      color: var(--grpf-accent);
    }

    .toggle-button:focus-visible {
      outline: 2px solid var(--grpf-accent);
      outline-offset: -2px;
    }

    .toggle-icon svg {
      width: 14px;
      height: 14px;
    }

    .platform-divider {
      height: 1px;
      margin: 5px 2px;
      background: var(--grpf-border-muted);
    }

    .hidden-asset {
      display: none !important;
    }

    .Box--condensed .Box-row.grpf-group-start:not(:first-child) {
      border-top: 1px solid var(--grpf-border);
    }

    @media (prefers-reduced-motion: reduce) {
      .platform-filter,
      .platform-filter *,
      .platform-arches,
      .platform-arches-inner,
      .markdown-body.grpf-collapsible,
      .toggle-icon {
        transition: none !important;
      }
    }
  `;

  const currentPlatform = getCurrentPlatform();
  let selectedCategories = loadSelection();
  let selectedArchitectures = loadArchitectureSelection();
  let selectedPackageTypes = loadPackageTypeSelection();
  let platformOrder = loadPlatformOrder();

  let panel = null;
  let dropdown = null;
  let filterButton = null;
  let summaryEl = null;
  let badgeEl = null;
  let saveButtonEl = null;
  const optionEls = new Map();
  const countEls = new Map();
  const archEls = new Map();

  let refreshTimer = null;
  let contentObserver = null;
  const watchedContainers = new WeakSet();

  function getCurrentPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';

    const platform = (
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      ''
    ).toLowerCase();
    if (platform.includes('win')) return 'windows';
    if (
      platform.includes('mac') ||
      platform.includes('iphone') ||
      platform.includes('ipad')
    ) {
      return 'macos';
    }
    if (platform.includes('linux') || platform.includes('x11')) return 'linux';
    return null;
  }

  function loadSelection() {
    const stored = GM_getValue(STORAGE_KEY, null);
    if (!Array.isArray(stored)) {
      return currentPlatform ? [currentPlatform, 'other', 'source'] : [];
    }
    const schema = GM_getValue(FILTER_SCHEMA_KEY, 0);
    let next = CATEGORY_IDS.filter((id) => stored.includes(id));
    if (schema < FILTER_SCHEMA_VERSION && next.length) {
      const migrated = next.concat(
        ['other', 'source'].filter((id) => !next.includes(id))
      );
      next = CATEGORY_IDS.filter((id) => migrated.includes(id));
    }
    return next;
  }

  function loadArchitectureSelection() {
    const stored = GM_getValue(ARCH_STORAGE_KEY, null);
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return {};
    }
    const result = {};
    PLATFORM_IDS.forEach((platformId) => {
      if (!selectedCategories.includes(platformId)) return;
      const raw = stored[platformId];
      if (!Array.isArray(raw)) return;
      const valid = ARCHITECTURES[platformId]
        .filter((definition) => raw.includes(definition.id))
        .map((definition) => definition.id);
      if (valid.length) result[platformId] = valid;
    });
    return result;
  }

  function getArchitectureMatches(platformId, name) {
    const definitions = ARCHITECTURES[platformId] || [];
    return definitions
      .filter((definition) => definition.pattern.test(name))
      .map((definition) => definition.id);
  }

  function getSelectedArchitectures(platformId) {
    return selectedArchitectures[platformId] || [];
  }

  function loadPackageTypeSelection() {
    const stored = GM_getValue(TYPE_STORAGE_KEY, null);
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return {};
    }
    const result = {};
    PLATFORM_IDS.forEach((platformId) => {
      if (!selectedCategories.includes(platformId)) return;
      const raw = stored[platformId];
      if (!Array.isArray(raw)) return;
      const valid = PACKAGE_TYPE_IDS.filter((id) => raw.includes(id));
      if (valid.length) result[platformId] = valid;
    });
    return result;
  }

  function getSelectedPackageTypes(platformId) {
    return selectedPackageTypes[platformId] || [];
  }

  function loadPlatformOrder() {
    const stored = GM_getValue(ORDER_STORAGE_KEY, null);
    const order = [];
    if (Array.isArray(stored)) {
      stored.forEach((id) => {
        if (PLATFORM_IDS.includes(id) && !order.includes(id)) order.push(id);
      });
    }
    PLATFORM_IDS.forEach((id) => {
      if (!order.includes(id)) order.push(id);
    });
    return order;
  }

  function getPackageTypeMatches(name) {
    return PACKAGE_TYPES.filter((type) => type.pattern.test(name)).map(
      (type) => type.id
    );
  }

  function getPlatformMatches(text) {
    const matches = {};
    PLATFORMS.forEach((platform) => {
      matches[platform.id] = platform.pattern.test(text);
    });
    return matches;
  }

  function getAssets() {
    return Array.from(document.querySelectorAll(ASSET_ROW_SELECTOR)).filter(
      (row) => !row.querySelector('.js-release-asset-untruncate-btn')
    );
  }

  function getAssetName(asset) {
    const nameEl = asset.querySelector(
      '.text-bold, .asset-name, a[href*="/releases/download/"]'
    );
    return ((nameEl || asset).textContent || '').trim();
  }

  function isSourceCodeAsset(asset) {
    if (asset.querySelector('a[href*="/archive/"]')) return true;
    return /^source code\b/i.test(getAssetName(asset).trim());
  }

  function getAssetGroupKey(asset) {
    if (isSourceCodeAsset(asset)) return 'source';
    const matches = getPlatformMatches(getAssetName(asset));
    for (const platformId of platformOrder) {
      if (matches[platformId]) return platformId;
    }
    return 'other';
  }

  function getGroupRank(group) {
    const index = platformOrder.indexOf(group);
    if (index !== -1) return index;
    return group === 'other' ? platformOrder.length : platformOrder.length + 1;
  }

  function regroupAssets() {
    document.querySelectorAll('.Box--condensed').forEach((container) => {
      const rows = Array.from(container.querySelectorAll(ASSET_ROW_SELECTOR));
      if (!rows.length) return;
      const list = rows[0].parentElement;
      if (!list) return;

      const assetRows = rows.filter(
        (row) => !row.querySelector('.js-release-asset-untruncate-btn')
      );
      if (!assetRows.length) return;

      const ranked = assetRows
        .map((row, index) => ({
          row,
          index,
          rank: getGroupRank(getAssetGroupKey(row)),
        }))
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .map((item) => item.row);

      const nonAssets = Array.from(list.children).filter(
        (child) => !assetRows.includes(child)
      );
      const desired = ranked.concat(nonAssets);
      const current = Array.from(list.children);
      const sameOrder =
        current.length === desired.length &&
        current.every((child, index) => child === desired[index]);
      if (!sameOrder) {
        desired.forEach((child) => list.appendChild(child));
      }

      let lastGroup = null;
      ranked.forEach((row) => {
        const group = getAssetGroupKey(row);
        row.dataset.grpfGroup = group;
        row.classList.toggle('grpf-group-start', group !== lastGroup);
        lastGroup = group;
      });
      nonAssets.forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        child.classList.remove('grpf-group-start');
        delete child.dataset.grpfGroup;
      });
    });
  }

  function shouldShowAsset(asset) {
    if (selectedCategories.length === 0) return true;
    if (isSourceCodeAsset(asset)) {
      return selectedCategories.includes('source');
    }
    const name = getAssetName(asset);
    const matches = getPlatformMatches(name);
    const matchedPlatforms = PLATFORM_IDS.filter((id) => matches[id]);
    if (!matchedPlatforms.length) {
      return selectedCategories.includes('other');
    }
    return matchedPlatforms.some((platformId) => {
      if (!selectedCategories.includes(platformId)) return false;
      const selectedArchs = getSelectedArchitectures(platformId);
      if (selectedArchs.length) {
        const assetArchs = getArchitectureMatches(platformId, name);
        if (assetArchs.length && !assetArchs.some((id) => selectedArchs.includes(id))) {
          return false;
        }
      }
      const selectedTypes = getSelectedPackageTypes(platformId);
      if (selectedTypes.length) {
        const assetTypes = getPackageTypeMatches(name);
        if (!assetTypes.some((id) => selectedTypes.includes(id))) return false;
      }
      return true;
    });
  }

  function getStats() {
    const counts = {};
    const archCounts = {};
    const typeCounts = {};
    CATEGORY_IDS.forEach((id) => {
      counts[id] = 0;
    });
    PLATFORM_IDS.forEach((id) => {
      archCounts[id] = {};
      typeCounts[id] = {};
    });

    let visible = 0;
    const assets = getAssets();
    assets.forEach((asset) => {
      if (isSourceCodeAsset(asset)) {
        counts.source += 1;
      } else {
        const name = getAssetName(asset);
        const matches = getPlatformMatches(name);
        const matchedPlatforms = PLATFORM_IDS.filter((id) => matches[id]);
        if (matchedPlatforms.length) {
          matchedPlatforms.forEach((id) => {
            counts[id] += 1;
            getArchitectureMatches(id, name).forEach((archId) => {
              archCounts[id][archId] = (archCounts[id][archId] || 0) + 1;
            });
            getPackageTypeMatches(name).forEach((typeId) => {
              typeCounts[id][typeId] = (typeCounts[id][typeId] || 0) + 1;
            });
          });
        } else {
          counts.other += 1;
        }
      }
      if (shouldShowAsset(asset)) visible += 1;
    });

    return { total: assets.length, visible, counts, archCounts, typeCounts };
  }

  function applyFilters() {
    getAssets().forEach((asset) => {
      asset.classList.toggle('hidden-asset', !shouldShowAsset(asset));
    });
    syncPanel();
  }

  function setSelectedCategories(next) {
    selectedCategories = CATEGORY_IDS.filter((id) => next.includes(id));
    const prunedArchs = {};
    const prunedTypes = {};
    selectedCategories.forEach((platformId) => {
      if (selectedArchitectures[platformId]) {
        prunedArchs[platformId] = selectedArchitectures[platformId];
      }
      if (selectedPackageTypes[platformId]) {
        prunedTypes[platformId] = selectedPackageTypes[platformId];
      }
    });
    selectedArchitectures = prunedArchs;
    selectedPackageTypes = prunedTypes;
    applyFilters();
  }

  function toggleCategory(id) {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((item) => item !== id)
      : selectedCategories.concat(id);
    setSelectedCategories(next);
  }

  function toggleArchitecture(platformId, archId) {
    if (!selectedCategories.includes(platformId)) return;
    const current = getSelectedArchitectures(platformId);
    const next = current.includes(archId)
      ? current.filter((id) => id !== archId)
      : current.concat(archId);
    const copy = { ...selectedArchitectures };
    if (next.length) {
      copy[platformId] = next;
    } else {
      delete copy[platformId];
    }
    selectedArchitectures = copy;
    applyFilters();
  }

  function togglePackageType(platformId, typeId) {
    if (!selectedCategories.includes(platformId)) return;
    const current = getSelectedPackageTypes(platformId);
    const next = current.includes(typeId)
      ? current.filter((id) => id !== typeId)
      : current.concat(typeId);
    const copy = { ...selectedPackageTypes };
    if (next.length) {
      copy[platformId] = next;
    } else {
      delete copy[platformId];
    }
    selectedPackageTypes = copy;
    applyFilters();
  }

  function createMoveButton(platformId, direction, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'move-button';
    button.dataset.direction = direction < 0 ? 'up' : 'down';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = direction < 0 ? ICONS.chevronUp : ICONS.chevronDown;
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      movePlatform(platformId, direction);
    });
    return button;
  }

  function movePlatform(platformId, direction) {
    const index = platformOrder.indexOf(platformId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= platformOrder.length) return;
    const next = platformOrder.slice();
    next[index] = platformOrder[target];
    next[target] = platformOrder[index];
    platformOrder = next;
    GM_setValue(ORDER_STORAGE_KEY, platformOrder);
    reorderPlatformEntries();
    syncPanel();
    regroupAssets();
  }

  function reorderPlatformEntries() {
    if (!dropdown) return;
    const optionsEl = dropdown.querySelector('.platform-options');
    if (!optionsEl) return;
    const anchor = optionsEl.querySelector('.platform-divider');
    platformOrder.forEach((platformId) => {
      const archData = archEls.get(platformId);
      if (archData) optionsEl.insertBefore(archData.entry, anchor || null);
    });
  }

  let saveFeedbackTimer = null;

  function savePreference() {
    GM_setValue(STORAGE_KEY, selectedCategories);
    GM_setValue(ARCH_STORAGE_KEY, selectedArchitectures);
    GM_setValue(TYPE_STORAGE_KEY, selectedPackageTypes);
    GM_setValue(ORDER_STORAGE_KEY, platformOrder);
    GM_setValue(FILTER_SCHEMA_KEY, FILTER_SCHEMA_VERSION);
    if (!saveButtonEl) return;
    saveButtonEl.textContent = '已保存';
    saveButtonEl.classList.add('saved');
    if (saveFeedbackTimer) window.clearTimeout(saveFeedbackTimer);
    saveFeedbackTimer = window.setTimeout(() => {
      saveButtonEl.textContent = '保存为偏好';
      saveButtonEl.classList.remove('saved');
      saveFeedbackTimer = null;
    }, 1500);
  }

  function resetSaveButton() {
    if (!saveButtonEl) return;
    saveButtonEl.textContent = '保存为偏好';
    saveButtonEl.classList.remove('saved');
    if (saveFeedbackTimer) {
      window.clearTimeout(saveFeedbackTimer);
      saveFeedbackTimer = null;
    }
  }

  function syncPanel() {
    if (!panel) return;

    const { total, visible, counts, archCounts, typeCounts } = getStats();
    const filtering = selectedCategories.length > 0;

    panel.dataset.filtering = String(filtering);
    badgeEl.textContent = String(selectedCategories.length);
    badgeEl.hidden = !filtering;

    const pending = !total && getPendingAssetsFragment();
    const truncated = Boolean(
      document.querySelector('.js-release-asset-untruncate-btn')
    );
    if (pending) {
      summaryEl.textContent = '资源加载中…';
      summaryEl.title = '';
    } else if (truncated) {
      summaryEl.textContent = filtering
        ? `显示 ${visible} / ${total} · 已加载`
        : `已加载 ${total} 个资源`;
      summaryEl.title = '部分资源尚未加载，可在资源列表中点击 Show all';
    } else {
      summaryEl.textContent = filtering
        ? `显示 ${visible} / ${total} 个资源`
        : `共 ${total} 个资源`;
      summaryEl.title = '';
    }

    PLATFORMS.forEach((platform) => {
      const option = optionEls.get(platform.id);
      const countEl = countEls.get(platform.id);
      if (!option || !countEl) return;
      const active = selectedCategories.includes(platform.id);
      option.classList.toggle('selected', active);
      option.setAttribute('aria-checked', String(active));
      countEl.textContent = String(counts[platform.id]);

      const archData = archEls.get(platform.id);
      if (!archData) return;
      archData.entry.classList.toggle('selected', active);
      if (archData.moveButtons) {
        const orderIndex = platformOrder.indexOf(platform.id);
        archData.moveButtons.up.disabled = orderIndex <= 0;
        archData.moveButtons.down.disabled =
          orderIndex >= platformOrder.length - 1;
      }
      const platformArchCounts = archCounts[platform.id] || {};
      const activeArchs = getSelectedArchitectures(platform.id);
      let hasChipOptions = false;

      ARCHITECTURES[platform.id].forEach((definition) => {
        const chipData = archData.chips.get(definition.id);
        if (!chipData) return;
        const count = platformArchCounts[definition.id] || 0;
        const selected = activeArchs.includes(definition.id);
        const show = count > 0 || selected;
        chipData.button.hidden = !show;
        chipData.button.classList.toggle('selected', selected);
        chipData.button.setAttribute('aria-pressed', String(selected));
        chipData.countEl.textContent = String(count);
        if (show) hasChipOptions = true;
      });

      const platformTypeCounts = typeCounts[platform.id] || {};
      const activeTypes = getSelectedPackageTypes(platform.id);
      archData.typeChips.forEach((chipData, typeId) => {
        const count = platformTypeCounts[typeId] || 0;
        const selected = activeTypes.includes(typeId);
        const show = count > 0 || selected;
        chipData.button.hidden = !show;
        chipData.button.classList.toggle('selected', selected);
        chipData.button.setAttribute('aria-pressed', String(selected));
        chipData.countEl.textContent = String(count);
        if (show) hasChipOptions = true;
      });

      archData.archesEl.hidden = !hasChipOptions;
    });

    EXTRA_CATEGORIES.forEach((category) => {
      const option = optionEls.get(category.id);
      const countEl = countEls.get(category.id);
      if (!option || !countEl) return;
      const active = selectedCategories.includes(category.id);
      option.classList.toggle('selected', active);
      option.setAttribute('aria-checked', String(active));
      countEl.textContent = String(counts[category.id]);
    });
  }

  function openDropdown() {
    if (!dropdown) return;
    dropdown.classList.add('show');
    filterButton.setAttribute('aria-expanded', 'true');
    syncPanel();
  }

  function closeDropdown(restoreFocus) {
    if (!dropdown || !dropdown.classList.contains('show')) return;
    dropdown.classList.remove('show');
    filterButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) filterButton.focus();
  }

  function toggleDropdown() {
    if (dropdown.classList.contains('show')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'platform-filter';
    panel.dataset.filtering = 'false';

    filterButton = document.createElement('button');
    filterButton.type = 'button';
    filterButton.className = 'platform-filter-button';
    filterButton.setAttribute('aria-label', '筛选');
    filterButton.setAttribute('aria-haspopup', 'dialog');
    filterButton.setAttribute('aria-expanded', 'false');
    filterButton.setAttribute('aria-controls', 'grpf-dropdown');
    filterButton.innerHTML = `${ICONS.filter}<span class="platform-filter-label">筛选</span><span class="platform-filter-badge" hidden></span>`;
    filterButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleDropdown();
    });

    badgeEl = filterButton.querySelector('.platform-filter-badge');

    dropdown = document.createElement('div');
    dropdown.id = 'grpf-dropdown';
    dropdown.className = 'platform-dropdown';
    dropdown.setAttribute('role', 'dialog');
    dropdown.setAttribute('aria-label', '筛选');
    dropdown.innerHTML = `
      <div class="platform-dropdown-head">
        <span class="platform-dropdown-title">筛选</span>
        <span class="platform-dropdown-summary"></span>
      </div>
      <div class="platform-options" role="group" aria-label="筛选类别"></div>
      <div class="platform-dropdown-footer">
        <button type="button" class="platform-action" data-action="save">保存为偏好</button>
        <button type="button" class="platform-action" data-action="reorder">排序</button>
        <button type="button" class="platform-action" data-action="all">显示全部</button>
      </div>
    `;
    dropdown.addEventListener('click', (event) => event.stopPropagation());

    summaryEl = dropdown.querySelector('.platform-dropdown-summary');
    const optionsEl = dropdown.querySelector('.platform-options');

    CATEGORIES.forEach((category) => {
      if (category.id === 'other') {
        const divider = document.createElement('div');
        divider.className = 'platform-divider';
        optionsEl.appendChild(divider);
      }

      const entry = document.createElement('div');
      entry.className = 'platform-entry';
      entry.dataset.platform = category.id;

      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'platform-option';
      option.dataset.platform = category.id;
      option.setAttribute('role', 'menuitemcheckbox');
      option.setAttribute('aria-checked', 'false');
      option.innerHTML = `
        <span class="platform-option-icon">${category.icon}</span>
        <span class="platform-option-name">${category.name}</span>
        <span class="platform-option-count">0</span>
        <span class="platform-option-check">${ICONS.check}</span>
      `;
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCategory(category.id);
      });

      const row = document.createElement('div');
      row.className = 'platform-row';
      row.appendChild(option);

      let moveButtons = null;
      if (PLATFORM_IDS.includes(category.id)) {
        const move = document.createElement('div');
        move.className = 'platform-move';
        const upButton = createMoveButton(category.id, -1, '上移');
        const downButton = createMoveButton(category.id, 1, '下移');
        move.appendChild(upButton);
        move.appendChild(downButton);
        row.appendChild(move);
        moveButtons = { up: upButton, down: downButton };
      }
      entry.appendChild(row);

      if (ARCHITECTURES[category.id]) {
        const archesEl = document.createElement('div');
        archesEl.className = 'platform-arches';
        archesEl.hidden = true;
        const archesInner = document.createElement('div');
        archesInner.className = 'platform-arches-inner';
        archesInner.setAttribute('role', 'group');
        archesInner.setAttribute('aria-label', `${category.name} 架构与安装类型`);

        const chips = new Map();
        ARCHITECTURES[category.id].forEach((definition) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'arch-chip';
          chip.dataset.arch = definition.id;
          chip.setAttribute('aria-pressed', 'false');
          chip.appendChild(document.createTextNode(definition.name));
          const chipCountEl = document.createElement('span');
          chipCountEl.className = 'arch-chip-count';
          chipCountEl.textContent = '0';
          chip.appendChild(chipCountEl);
          chip.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleArchitecture(category.id, definition.id);
          });
          archesInner.appendChild(chip);
          chips.set(definition.id, { button: chip, countEl: chipCountEl });
        });

        const chipsBreak = document.createElement('span');
        chipsBreak.className = 'chips-break';
        chipsBreak.setAttribute('aria-hidden', 'true');
        archesInner.appendChild(chipsBreak);

        const typeChips = new Map();
        PACKAGE_TYPES.forEach((type) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'arch-chip';
          chip.dataset.type = type.id;
          chip.setAttribute('aria-pressed', 'false');
          chip.appendChild(document.createTextNode(type.name));
          const chipCountEl = document.createElement('span');
          chipCountEl.className = 'arch-chip-count';
          chipCountEl.textContent = '0';
          chip.appendChild(chipCountEl);
          chip.addEventListener('click', (event) => {
            event.stopPropagation();
            togglePackageType(category.id, type.id);
          });
          archesInner.appendChild(chip);
          typeChips.set(type.id, { button: chip, countEl: chipCountEl });
        });

        archesEl.appendChild(archesInner);
        entry.appendChild(archesEl);
        archEls.set(category.id, {
          entry,
          archesEl,
          chips,
          typeChips,
          moveButtons,
        });
      }

      optionsEl.appendChild(entry);
      optionEls.set(category.id, option);
      countEls.set(category.id, option.querySelector('.platform-option-count'));
    });

    saveButtonEl = dropdown.querySelector('[data-action="save"]');
    saveButtonEl.addEventListener('click', savePreference);
    resetSaveButton();

    const reorderButton = dropdown.querySelector('[data-action="reorder"]');
    reorderButton.addEventListener('click', () => {
      const active = panel.dataset.reorder !== 'true';
      panel.dataset.reorder = String(active);
      reorderButton.textContent = active ? '完成' : '排序';
      reorderButton.classList.toggle('active', active);
      syncPanel();
    });

    dropdown
      .querySelector('[data-action="all"]')
      .addEventListener('click', () => {
        setSelectedCategories([]);
      });

    reorderPlatformEntries();

    panel.appendChild(filterButton);
    panel.appendChild(dropdown);
    document.body.appendChild(panel);

    syncPanel();
  }

  function getPendingAssetsFragment() {
    return document.querySelector(
      'include-fragment[src*="expanded_assets"], include-fragment[data-deferred-src*="expanded_assets"]'
    );
  }

  function hasAssetArea() {
    return Boolean(
      document.querySelector('.Box--condensed .Box-row') ||
        getPendingAssetsFragment()
    );
  }

  function clearPanelRefs() {
    panel = null;
    dropdown = null;
    filterButton = null;
    summaryEl = null;
    badgeEl = null;
    saveButtonEl = null;
    optionEls.clear();
    countEls.clear();
    archEls.clear();
    if (saveFeedbackTimer) {
      window.clearTimeout(saveFeedbackTimer);
      saveFeedbackTimer = null;
    }
  }

  function ensurePanel() {
    if (panel && !panel.isConnected) {
      clearPanelRefs();
    }
    if (!panel && hasAssetArea()) {
      buildPanel();
    }
  }

  function teardownPanel() {
    if (panel) panel.remove();
    clearPanelRefs();
  }

  function renderToggleIcon(expanded) {
    const icon = expanded ? ICONS.chevronUp : ICONS.chevronDown;
    return `<span class="toggle-icon">${icon}</span>`;
  }

  function createToggleButton(body) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toggle-button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', '展开');
    button.innerHTML = renderToggleIcon(false);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const expanded = body.classList.toggle('expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? '收起' : '展开');
      button.innerHTML = renderToggleIcon(expanded);
      if (expanded) {
        const top = body.getBoundingClientRect().top + window.scrollY - 80;
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        window.scrollTo({
          top: Math.max(top, 0),
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      }
    });
    return button;
  }

  function enhanceReleaseNotes() {
    document.querySelectorAll(RELEASE_BODY_SELECTOR).forEach((body) => {
      if (body.classList.contains('grpf-collapsible')) {
        if (!body.querySelector('.toggle-button')) {
          body.classList.remove('expanded');
          body.appendChild(createToggleButton(body));
        }
        return;
      }
      if (body.scrollHeight <= COLLAPSE_LIMIT) return;
      body.classList.add('grpf-collapsible');
      body.appendChild(createToggleButton(body));
    });
  }

  function ensureAssetObservers() {
    document.querySelectorAll('.Box--condensed').forEach((container) => {
      if (watchedContainers.has(container)) return;
      if (!container.querySelector(ASSET_ROW_SELECTOR)) return;
      watchedContainers.add(container);
      const observer = new MutationObserver(scheduleRefresh);
      observer.observe(container, { childList: true, subtree: true });
    });
  }

  function scheduleRefresh() {
    if (refreshTimer) return;
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      refresh();
    }, 150);
  }

  function refresh() {
    if (!isReleasesPage()) {
      teardownPanel();
      return;
    }
    ensureAssetObservers();
    enhanceReleaseNotes();
    ensurePanel();
    applyFilters();
    regroupAssets();
  }

  function isReleasesPage() {
    return /\/releases(?:\/|$)/.test(window.location.pathname);
  }

  function addStyles() {
    if (document.querySelector('style[data-github-release-filter]')) return;
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-github-release-filter', 'true');
    styleElement.textContent = STYLES;
    document.head.appendChild(styleElement);
  }

  function startContentObserver() {
    if (!document.body) return;
    if (contentObserver) contentObserver.disconnect();
    contentObserver = new MutationObserver((mutations) => {
      const changedOutsidePanel = mutations.some((mutation) => {
        const node =
          mutation.target.nodeType === 1
            ? mutation.target
            : mutation.target.parentElement;
        return !(node && node.closest && node.closest('.platform-filter'));
      });
      if (changedOutsidePanel) scheduleRefresh();
    });
    contentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function handleGlobalClick(event) {
    if (!dropdown || !dropdown.classList.contains('show')) return;
    if (panel && panel.contains(event.target)) return;
    closeDropdown();
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape') closeDropdown(true);
  }

  function bootstrap() {
    if (!isReleasesPage()) {
      teardownPanel();
      return;
    }
    if (!document.body || !document.head) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap, {
          once: true,
        });
      }
      return;
    }
    addStyles();
    startContentObserver();
    refresh();
  }

  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('turbo:load', bootstrap);
  window.addEventListener('popstate', bootstrap);

  bootstrap();
})();
