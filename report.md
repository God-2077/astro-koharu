# React Grab 总是被启用问题 — 调查报告

## 问题描述

在 `pnpm build`（生产环境）和 `pnpm dev`（开发环境）中，React Grab 始终被加载并自动初始化，即使未设置 `REACT_GRAB=true` 环境变量。

## 影响范围

| 影响项 | 详情 |
|--------|------|
| 生产构建 | 页面 HTML 中包含 `<script type="module" src="/_astro/Layout.astro_astro_type_script_index_2_lang.xxx.js">` 脚本标签，加载 react-grab |
| Bundle 体积 | 生产 dist 中包含 ~280KB 的 react-grab 相关 JS chunk（`index.B-CP2Mdv.js` 183KB + `renderer-WYB2HHU6.js` 97KB） |
| 运行时行为 | react-grab 模块加载后自动初始化，创建 `window.__REACT_GRAB__` 全局实例并派发 `react-grab:init` 事件 |

## 根本原因

存在**两个独立的 bug**，导致 react-grab 总是被构建和加载。

### Bug 1：`import.meta.env.DEV` 在 Astro 前端脚本中始终为 `true`（`src/layouts/Layout.astro:57`）

原代码：
```js
const enableReactGrab = import.meta.env.DEV && import.meta.env.REACT_GRAB === 'true';
```

在 Astro 5.x 的 SSR 前端脚本上下文中，`import.meta.env.DEV` 即使在 `astro build` 时也解析为 `true`。这使得在生产构建中该条件实际上只依赖 `REACT_GRAB` 环境变量——但该变量也未设置，因此条件整体应评估为 `false`。

### Bug 2：Astro 编译器无条件提升条件语句中的 `<script>` 标签（`src/layouts/Layout.astro:200-204`）

原代码：
```astro
{enableReactGrab && (
  <script>
    import('react-grab');
  </script>
)}
```

**Astro 编译器在编译期提取所有 `<script>` 标签（不含 `is:inline` 的属性），不受 JSX 条件语句控制。**

验证方法：将条件硬编码为 `false`（`const enableReactGrab = false;`），重新构建后 `<script>` 标签仍然存在于输出 HTML 中。

```
dist/index.html:
<script type="module" src="/_astro/Layout.astro_astro_type_script_index_2_lang.BRztht0h.js"></script>
```

### 额外问题：react-grab 的自动初始化

react-grab 的 `index.js` 模块在加载时直接执行自初始化逻辑：

```js
typeof window<"u"&&!window.__REACT_GRAB_DISABLED__&&(
  window.__REACT_GRAB__?n=window.__REACT_GRAB__:(n=f(),window.__REACT_GRAB__=n),
  c(n),
  window.dispatchEvent(new CustomEvent("react-grab:init",{detail:n}))
);
```

只要模块被浏览器加载，react-grab 会自动初始化，无需手动调用。

## 修复方案

### 修改 1：`src/layouts/Layout.astro`

- **移除**内联的 `<script>import('react-grab')</script>` 块
- **移除** `import.meta.env.DEV` 条件（该条件实际上无效）
- 改为渲染一个 React 组件，通过 `client:load` 指令按需加载：

```astro
// 前端脚本
const enableReactGrab = import.meta.env.REACT_GRAB === 'true';

// 模板中
{enableReactGrab && <ReactGrabInit client:load />}
```

### 修改 2：`src/components/dev/ReactGrabInit.tsx`（新建）

```tsx
import { useEffect } from 'react';

export default function ReactGrabInit() {
  useEffect(() => {
    import('react-grab');
  }, []);
  return null;
}
```

React 组件仅在服务端渲染时被包含在 HTML 中（`enableReactGrab === true` 时）；`client:load` 指令确保其 JS bundle 仅在页面加载时被浏览器下载和执行；组件挂载后通过 `useEffect` 动态导入 react-grab。

## 修复效果

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 生产构建（未设置 REACT_GRAB） | react-grab 被加载并初始化 | 不加载，不初始化 |
| 开发模式（未设置 REACT_GRAB） | react-grab 被加载并初始化 | 不加载，不初始化 |
| 任意环境（设置了 REACT_GRAB=true） | 正常工作 | 正常工作 |

## 涉及文件

| 文件 | 操作 |
|------|------|
| `src/layouts/Layout.astro` | 修改 — 将内联脚本替换为条件 React 组件 |
| `src/components/dev/ReactGrabInit.tsx` | 新建 — 按需加载 react-grab 的 React 组件 |

## 备注

- react-grab 当前作为 `dependencies` 安装在 `package.json` 中，不会因本次修改而需要卸载
- 若需在开发环境中启用 react-grab，在 `.env` 文件中设置 `REACT_GRAB=true`
- `.env.example` 中已包含该变量的注释模板：`# REACT_GRAB=true`
