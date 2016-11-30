---
title: sql语句：根据身份证得到省份、生日、性别
categories: [mysql]
tags: [mysql]
date: 2016-11-30 16:08:54
description: 根据身份证得到省份、生日、性别
---

### 根据身份证得到省份
CASE 
WHEN SUBSTRING(id_card_no,1,2)=11  THEN  '北京市'	      
WHEN SUBSTRING(id_card_no,1,2)=12  THEN  '天津市'	      
WHEN SUBSTRING(id_card_no,1,2)=13  THEN  '河北省'  	      
WHEN SUBSTRING(id_card_no,1,2)=14  THEN  '山西省'  	      
WHEN SUBSTRING(id_card_no,1,2)=15  THEN  '内蒙古自治区'     
WHEN SUBSTRING(id_card_no,1,2)=21  THEN  '辽宁省'  	      
WHEN SUBSTRING(id_card_no,1,2)=22  THEN  '吉林省'  	      
WHEN SUBSTRING(id_card_no,1,2)=23  THEN  '黑龙江省'  	      
WHEN SUBSTRING(id_card_no,1,2)=31  THEN  '上海市'  	      
WHEN SUBSTRING(id_card_no,1,2)=32  THEN  '江苏省'  	      
WHEN SUBSTRING(id_card_no,1,2)=33  THEN  '浙江省'  	      
WHEN SUBSTRING(id_card_no,1,2)=34  THEN  '安徽省'  	      
WHEN SUBSTRING(id_card_no,1,2)=35  THEN  '福建省'  	      
WHEN SUBSTRING(id_card_no,1,2)=36  THEN  '江西省'  	      
WHEN SUBSTRING(id_card_no,1,2)=37  THEN  '山东省'  	      
WHEN SUBSTRING(id_card_no,1,2)=41  THEN  '河南省'  	      
WHEN SUBSTRING(id_card_no,1,2)=42  THEN  '湖北省'  	      
WHEN SUBSTRING(id_card_no,1,2)=43  THEN  '湖南省'  	      
WHEN SUBSTRING(id_card_no,1,2)=44  THEN  '广东省'  	      
WHEN SUBSTRING(id_card_no,1,2)=45  THEN  '广西壮族自治区'  
WHEN SUBSTRING(id_card_no,1,2)=46  THEN  '海南省'  	      
WHEN SUBSTRING(id_card_no,1,2)=50  THEN  '重庆市'  	      
WHEN SUBSTRING(id_card_no,1,2)=51  THEN  '四川省'  	      
WHEN SUBSTRING(id_card_no,1,2)=52  THEN  '贵州省'  	      
WHEN SUBSTRING(id_card_no,1,2)=53  THEN  '云南省'  	      
WHEN SUBSTRING(id_card_no,1,2)=54  THEN  '西藏自治区'       
WHEN SUBSTRING(id_card_no,1,2)=61  THEN  '陕西省'  	      
WHEN SUBSTRING(id_card_no,1,2)=62  THEN  '甘肃省'  	      
WHEN SUBSTRING(id_card_no,1,2)=63  THEN  '青海省'  	      
WHEN SUBSTRING(id_card_no,1,2)=64  THEN  '宁夏回族自治区'  
WHEN SUBSTRING(id_card_no,1,2)=65  THEN  '新疆维吾尔自治区' 
WHEN SUBSTRING(id_card_no,1,2)=71  THEN  '台湾省'	      
WHEN SUBSTRING(id_card_no,1,2)=81  THEN  '香港特别行政区'   
WHEN SUBSTRING(id_card_no,1,2)=91  THEN  '澳门特别行政区'  
END AS '省份',

### 生日
SUBSTRING(id_card_no,7,8) AS '生日'

### 性别
CASE WHEN (SUBSTRING(u.id_card_no,LENGTH(u.id_card_no)-1,1)%2=0) THEN '女' ELSE '男' END