---
title: 常用xpath例子
categories: [xpath]
tags: [xpath]
date: 2017-08-10 10:40:40
description: 常用xpath例子
---

常用xpath例子

根据字符串匹配节点，通过contains()、text()匹配
.//*[@id='detail_all']/div[1]/ul/li[contains(text(), '字 数：')]/text()

节点属性不包含*字符串，通过not()、contains()匹配
`.//[@id=’con_ListStyleTab4A_1’]/p[not(contains(@class, ‘title’))]/a[@class=’Author’]/text()`

截取字符串匹配
substring-before(//div[@class='content']/ul/li[6],',')
substring(.//h2/../p/span[contains(text(), '字数：')]/text(), '4')

索引匹配末尾节点，通过last()匹配
.//div[last()]/div[@class='show_info_right max_width']/text()

通过..向上级查找匹配
.//h1/../div[@class='booksub']/span/span/text()

获取过个节点下的内容，通过//node()/text()可以获取当前节点及其子节点的内容。
.//*[@id='job_detail']/dd[@class='job-advantage']//node()/text()

有的时候页面中一系列数据下面并不一定包含某些字段，这时我们通过contains()来匹配包含某些关键字的节点来寻找对应的另一个节点。
.//div[@class='infobox']//node()[contains(text(), '户型')]/../node()/text()