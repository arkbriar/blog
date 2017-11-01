---
title: "MWeb With Hugo"
date: 2017-11-01T18:34:30+08:00
draft: false
categories: ["Kits"]
tags: ["mweb", "hugo", "markdown", "editor"]
toc: true
comments: true
---

前两天发现了一个好用的 markdown 编辑器叫 MWeb，支持好多Blog的直接发布，同时对两种静态网页生成器有直接的支持 (hexo/jelly)，然而对 hugo 却并没有支持，好在大家工作原理都差不多，稍微改改就能用上了。

## Media Path

Hugo 的静态资源文件放在 static 目录下，对于 MWeb 的解析来说比较尴尬，而通常我们会将图片放在诸如 static/img 的文件夹下，所以解决方案之一是对 static/img 做软链

```bash
$ ln -sf static/img .
```

并把 Media Folder Name 设置为 img，并把路径改为 Absolute 模式。

这样就能完美支持 hugo 下的文档编辑了。


## MathJax

Hugo 的 markdown 渲染木块 blackfriday 会将 `$` 或是 $$ 中的 `_` 中识别为 `<em>` 段落，导致渲染错误，至今还没修复...

关于 MathJax 引起的问题的解决方案：
https://gohugo.io/content-management/formats/#mathjax-with-hugo

## Conclusion

现在我们就能使用 MWeb 愉快的编辑 Blog 里的文章了！

![](/img/15095349596229.jpg)





