---
title: "MWeb With Hugo"
published: 2017-11-01T18:34:30+08:00
draft: false
category: "Programming"
tags: ["hugo", "markdown", "tooling"]
---

A couple of days ago I discovered a great markdown editor called MWeb. It supports direct publishing to many blog platforms and has native support for two static site generators (hexo/jelly). However, it doesn't support Hugo. Fortunately, they all work on similar principles, so with a few tweaks it can be made to work.

## Media Path

Hugo places static resource files in the static directory, which is a bit awkward for MWeb's parsing. Typically we put images in a folder like static/img, so one solution is to create a symlink for static/img:

```bash
$ ln -sf static/img .
```

Then set the Media Folder Name to img and change the path to Absolute mode.

This enables seamless document editing under Hugo.


## MathJax

Hugo's markdown rendering module blackfriday interprets `_` inside `$` or $$ as `<em>` tags, causing rendering errors. This still hasn't been fixed...

Solution for MathJax-related issues:
https://gohugo.io/content-management/formats/#mathjax-with-hugo

## Conclusion

Now we can happily edit blog posts using MWeb!

![](/img/15095349596229.jpg)
