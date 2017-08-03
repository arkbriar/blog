---
title: "Dynamic Proxy in Java"
date: 2017-07-29T22:44:24+08:00
tags: ["java", "design pattern", "dynamic proxy"]
categories: ["Development", "Programming Language"]
toc: true
comments: true
draft: false
---

虽然在一年前就知道了 Proxy 模式，但是基本没有尝试使用过，仅在框架里看到一些例子。昨天翻阅《大型网站系统与Java中间件实践》时，偶然发现了 Proxy 模式在 Java 中的应用 —— 动态代理，遂记录下来，顺便复习一下 Proxy 模式。

<!--more-->

以下内容参考自 

1. 《Design Patterns》
2. 《大型网站系统与Java中间件实践》。
3. [http://www.baeldung.com/java-dynamic-proxies](http://www.baeldung.com/java-dynamic-proxies)

Proxy 模式图示：

![Proxy Pattern](/img/proxy_pattern.jpg)

### Proxy 模式

在《Design Patterns》书中提到了使用 Proxy 模式的四种常见情况：

1. **远程代理 (Remote Proxy)** 为一个对象在不同的地址空间提供局部代表。
2. **虚代理 (Virtual Proxy)** 根据需要创建开销很大的对象。
3. **保护代理 (Protection Proxy)** 控制对原始对象的访问。保护代理用于对象应该有不同的访问权限的时候。
4. **智能指针 (Smart Reference)** 引用计数、实现线程安全、延迟创建，熟悉 C++ 的同学应该知道 `std::share_ptr`、 `std::weak_ptr`、`std::unique_ptr` 等。

### Java 中的静态代理

这里借用 《大型网站系统与Java中间件实践》中的例子：

```java
public interface Calculator {
    int add(int a, int b);
}

public class CalculatorImpl implements Calculator {
    int add(int a, int b) {
        return a + b;
    }
}

public class CalculatorProxy implements Calculator {
    private Calculator calculator;
    
    public CalculatorProxy(Calculator calculator) {
        this.calculator = calculator;
    }
    
    int add(int a, int b) {
        // We can do anything before and after real add is called,
        // such as logging
        return calculator.add(a, b);
    }
}
```

可以看到，在 CalculatorProxy 中我们可以调用了真正的add操作，并可以在add前后做很多额外的工作，这种方式看上去十分直接，但是如果我们有一批类需要代理，并且代理类中实现的功能是一致的，那么我们就需要为每一个类都实现一个 XxxProxy 类，这将会十分麻烦。

### Java 中的动态代理

Java 中提供了一种方式使我们能够动态的生成一个类的代理，我们来看一个例子

```java
public class DynamicProxyPlayground {

    public static void main(String[] args) {
        Map mapProxyInstance = (Map) Proxy
            .newProxyInstance(DynamicProxyPlayground.class.getClassLoader(), new Class[]{Map.class},
                new TimingDynamicInvocationHandler(new HashMap<String, String>()));

        // DynamicProxyPlayground$TimingDynamicInvocationHandler invoke 
        // INFO: Executing put finished in 74094 ns.
        mapProxyInstance.put("hello", "world");

        CharSequence csProxyInstance = (CharSequence) Proxy.newProxyInstance(
            DynamicProxyPlayground.class.getClassLoader(),
            new Class[] { CharSequence.class },
            new TimingDynamicInvocationHandler("Hello World"));

        // DynamicProxyPlayground$TimingDynamicInvocationHandler invoke 
        // INFO: Executing length finished in 11720 ns.
        csProxyInstance.length();
    }

    public static class TimingDynamicInvocationHandler implements InvocationHandler {
        private static Logger logger =
            Logger.getLogger(TimingDynamicInvocationHandler.class.getName());

        private Object target;

        private TimingDynamicInvocationHandler(Object target) {
            this.target = target;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            long start = System.nanoTime();
            Object result = method.invoke(target, args);
            long elapsed = System.nanoTime() - start;

            logger.info(String.format("Executing %s finished in %d ns.", method.getName(), elapsed));
            return result;
        }
    }
}
```

在上述例子中，通过实现一个 `InvocationHandler`，我们就可以使用`Proxy.newInstance`为一批类创建功能相同的动态代理。
