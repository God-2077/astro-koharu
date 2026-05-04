# 添加 MDX 支持

为 Astro  项目添加 Astro MDX 集成，以便在页面中使用 MDX 格式。

可查阅 [Astro MDX 集成文档](https://docs.astro.build/zh-cn/guides/integrations-guide/mdx)。

## 测试

运行 `pnpm check` `pnpm lint` 检查项目是否符合 Astro 规范。

运行完上面的命令后，运行 `pnpm build` 构建项目。

检查输出日志，然后检查 dist 目录

清空 src\content\blog 目录，确保没有旧的博客文章干扰测试。

创建一个测试博客文章，用于验证 MDX 支持。

```mdx src\content\blog\test.mdx
---
title: '我的第一篇 MDX 博客'
author: 'Houston'
---

# {frontmatter.title}

作者：{frontmatter.author}

find the value of ABCABCEEF

# 测试内容

Two PI is: {Math.PI * 2}

export const num = 12123

num is: {num}
---

它应该在页面中显示为：

```html
<p>Two PI is: 6.283185307179586</p>
<p>num is: 12123</p>
```

在 dist 目录中搜索 ABCABCEEF 字段，找到对应的 HTML 文件。

检查 HTML 文件中是否包含以下内容：

```html
<p>Two PI is: 6.283185307179586</p>
<p>num is: 12123</p>
```