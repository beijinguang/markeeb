Context初始化流程

1.prepareRefresh

对刷新进行准备，包括设置开始时间、设置激活状态、初始化context环境中的占位符这个动作，根据之类的需求由子类来执行，然后验证是否却是必要的properties。

2.ConfiguratbleListableBeanFactory beanFactory=obtainFreshBeanfactory();

刷新并获得内部的Bean Factory。

3.prepareBeanFactory(beanFactory);

对beanFactory进行准备工作，比如设置类加载器和后置处理器，配置不进行自动装配的类型，注册默认的环境Bean。

4.postProcessBeanFactory(beanFactory);

为context的子类提供后置处理BeanFactory的扩展能力。如果子类想在Bean定义加载完成后，开始初始化上下文之前，做一些特殊逻辑，可以复写这个方法。

5.invokeBeanFactotyPostProcessors(beanFactory);

执行context中注册的beanfactory后缀处理器，这里有两种后置处理器一种是可以注册bean的后缀处理器。另一种是针对beanfactory进行处理的后置处理器。执行顺序是，先按照优先级执行可注册Bean的处理器，再按优先级执行针对Beanfactory的处理器。对springboot来书，这一步会进行BeanDefinition的解析。

6.registerBeanPostProcessors(beanFactory);

按照优先顺序在BeanFactory中注册Bean的后缀处理器，Bean后置处理器可以在Bean初始化前、后执行处理。

7.initMessageSource();

初始化消息源，消息源用来支持消息的国际化。

8.initApplicationEventMulticaster();

初始化应用事件广播器。事件广播器用来向ApplicationListener通知各种应用产生的事件，是一个标准的观察者模式。

9.onRefresh();

是留给子类的扩展步骤，用来让特定的Context子类初始化其他的bean。

10.registerListeners();

把实现了ApplicationListener的Bean注册到事件广播器，并对广播器中的早期未广播事件进行通知。

11.finishBeanFactoryInitialization(beanFactory);

冻结所有的Bean描述信息的修改，实例化非延迟加载的单例Bean

12.finishRefresh();

完成上下文的刷新工作，调用LifecycleProcessor的onFresh()方法以及发布ContextRefreshedEvent事件。

13.resetCommonCaches();

在finally中，执行第13步，重置公共的缓存，比如ReflectonUtils中的缓存、AnnotationUtils中的缓存等等。

