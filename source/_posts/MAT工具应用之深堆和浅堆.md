---
title: MAT工具应用之深堆和浅堆
categories: [jvm]
tags: [jvm]
date: 2017-03-20 11:21:11
description:
---

## MAT工具应用之深堆和浅堆

### 浅堆（Shallow Heap）

浅堆是指一个对象所消耗的内存（对象头+实例数据+对齐填充，不包括内部引用对象大小）

32位操作系统中
一个对象的对象头占用8字节，对象中的一个引用占4个字节，需要补齐位8的倍数
一维数组的为特殊对象，对象头占8个字节，加上4字节的长度数量，加上数组长度N*数组类型
String类型占用的字节数位40+2N+pandding（补齐为8的个数）

64位操作系统中
一个对象的对象头占用16字节，对象中的一个引用占8个字节，需要补齐位8的倍数
一维数组的为特殊对象，对象头占16个字节，加上8字节的长度数量，加上数组长度N*数组类型
String类型占用的字节数位64+2N+pandding（补齐为8的个数）



### 深堆（Retained Heap）

深堆表示一个对象被 GC 回收后，可以真实释放的内存大小（保留空间）



```java
package com.idea4j.jvm.mat;

public class Point {

    private int x;
    private int y;

    public Point(int x, int y) {
        super();
        this.x = x;
        this.y = y;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }
}

```



```java
package com.idea4j.jvm.mat;

public class Line {
    private Point startPoint;//
    private Point endPoint;

    public Line(Point startPoint, Point endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    public Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(Point startPoint) {
        this.startPoint = startPoint;
    }

    public Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(Point endPoint) {
        this.endPoint = endPoint;
    }
}

```

```java
package com.idea4j.jvm.mat;

public class ShallowRetainedDump {
    public static void main(String[] args) throws InterruptedException {
        //
        Point a = new Point(0, 0);
        Point b = new Point(1, 1);
        Point c = new Point(5, 3);
        Point d = new Point(9, 8);
        Point e = new Point(6, 7);
        Point f = new Point(3, 9);
        Point g = new Point(4, 8);

        Line aLine = new Line(a, b);
        Line bLine = new Line(a, c);
        Line cLine = new Line(d, e);
        Line dLine = new Line(f, g);
        a = null;
        b = null;
        c = null;
        d = null;
        e = null;

        Thread.sleep(1000000);
    }
}

```





### ![image-20200828200917670](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200828200917670.png)

如图（64位机器下），按照上面提到的  Line对象有两个Point对象组成 ,所以Line的浅

浅堆的大小为：对象头（16）+ 两个对象引用（8*2）=32，与图中数值不符。这是为什么呢？

这里是开启了指针压缩，开启指针压缩后，对象头占用字节为14，对象引用占用字节为4，那么，

浅堆的大小为：对象头（12）+ 两个对象引用（4*2）= 20，20不是8的倍数需要补齐，所以浅堆的大小为24.

```java
 * -XX:+UseCompressedOops开启指针压缩（默认） oop对象指针
 * -XX:-UseCompressedOops关闭指针压缩
```