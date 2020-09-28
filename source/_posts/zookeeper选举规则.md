---
title: zookeeper选举规则
categories: [zookeeper]
tags: [zookeeper]
date: 2020-07-15 11:11:07
description:
---

### zookeeper选举规则



角色：

1.LOOKING：竞选

​      2.OBSERVING：观察

​      3.FOLLOWING：跟随者

​      4.LEADER：领导者

投票信息：

​      1.logicalclock（electionEpoch）：本地选举周期，每次投票都会自增

​      2.epoch（peerEpoch）：选举周期，每次选举最终确定完leader结束选举流程时会自增(真正zxid的前32位)

​      3.zxid：数据ID，每次数据变动都会自增（真正zxid的后32位，zxid一共64位）

​      4.sid：该投票信息所属的serverId

​      5.leader：提议的leader（被提议的server的serverId，即sid）

没有leader时

投票比较规则：

​     1.epoch大的胜出，否则进行步骤2

​     2.zxid大的胜出，否则进行步骤3

​     3.sid大的胜出

