## 如何替换 JDK 的类



### 如何替换jdk中的类呢？Java提供了endorsed技术。

关于 endorsed ：可以的简单理解为 -Djava.endorsed.dirs 指定的目录面放置的jar文件，将有覆盖系统API的功能。但是能够覆盖的类是有限制的，其中不包括java.lang包中的类(出于安全的考虑)。



### 为什么必须使用 endorsed 进行替换 jdk 中的类呢？

因为java是采用双亲委派机制进行加载class类的。而jdk提供的类只能由类加载器Bootstrap进行加载。如果你想要在应用程序中替换掉jdk中的某个类是无法做到的，所以java提供了endorsed来达到你想要替换到系统中的类。

### 使用endorsed的两种方式：

- 运行的时候加上 -Djava.endorsed.dirs=D:\endorsed（jar包存放目录） 参数
- 将修改后的jar包放在：$JAVA_HOME/jre/lib/endorsed 、$JAVA_HOME/lib/endorsed 下面

### 实例

本实例通过修改ArrayList来试验:

1. 新建maven工程，在工程中新建java.util.ArrayList

2. 复制jdk中ArrayList源码到自己创建的ArrayList，并修改构造方法如下：

![image-20200911114253815](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20200911114253815.png)

3. 将工程打包成jar，复制到endorsed文件夹中
4. 新建测试类

```java
package com.idea4j.endorsed.test;

import java.util.ArrayList;
import java.util.List;

/**
 * -Djava.endorsed.dirs=D:\idea4j-endorsed\endorsed
 * -XX:+TraceClassLoading
 */
public class Test {
    public static void main(String[] args) {
        List list = new ArrayList();
        System.out.println(1);

    }
}

```
5. 修改运行参数，如图

![image-20200911114058420](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200911114058420.png)

6. 运行Test，结果如下：

![image-20200911114454953](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200911114454953.png)

看到Test类调用了我们修改的ArrayList，说明我们成功覆盖了jdk的类

但我们只调用一次new ArrayList(),为什么日志输出了这么多次呢？

我们在运行参数中在加入-XX:+TraceClassLoading看类加载过程可知，虚拟机启动时，有一些类调用了ArrayList默认构造器

![image-20200911123505455](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200911123505455.png)



上面我们使用了修改运行参数的方法，下面我们再试验第二种方法，把jar包copy到$JAVA_HOME/jre/lib/endorsed下，结果和上面一样。

但是copy到$JAVA_HOME/lib/endorsed下，结果是没有覆盖成功。这是为什么呢？如图，java-home应该为实际运行环境的目录。

![image-20200911130242199](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200911130242199.png)

经查看项目jdk配置

![image-20200911125011220](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200911125011220.png)

classpath指定的是jre，所以，把jar包copy到$JAVA_HOME/jre/lib/endorsed下才能成功也就说的通了。

[^1]: 参考连接：https://docs.oracle.com/javase/8/docs/technotes/guides/standards/

#### 





