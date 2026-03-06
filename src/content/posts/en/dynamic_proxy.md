---
title: "Dynamic Proxy in Java"
published: 2017-07-29T22:44:24+08:00
tags: ["java", "design-pattern", "proxy"]
category: "Programming"
draft: false
---

Although I learned about the Proxy pattern a year ago, I had barely tried using it, only seeing some examples in frameworks. Yesterday, while reading "Large-Scale Website Systems and Java Middleware in Practice," I stumbled upon an application of the Proxy pattern in Java -- dynamic proxies. I decided to write it down and review the Proxy pattern along the way.


The following content is referenced from:

1. "Design Patterns"
2. "Large-Scale Website Systems and Java Middleware in Practice"
3. [http://www.baeldung.com/java-dynamic-proxies](http://www.baeldung.com/java-dynamic-proxies)

Proxy pattern diagram:

![Proxy Pattern](/img/proxy_pattern.jpg)

### The Proxy Pattern

In "Design Patterns," four common situations for using the Proxy pattern are described:

1. **Remote Proxy** provides a local representative for an object in a different address space.
2. **Virtual Proxy** creates expensive objects on demand.
3. **Protection Proxy** controls access to the original object. Protection proxies are used when objects should have different access rights.
4. **Smart Reference** implements reference counting, thread safety, lazy creation, etc. Those familiar with C++ should know `std::share_ptr`, `std::weak_ptr`, `std::unique_ptr`, and so on.

### Static Proxy in Java

Here we borrow an example from "Large-Scale Website Systems and Java Middleware in Practice":

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

As you can see, in CalculatorProxy we call the real add operation and can do additional work before and after the call. This approach is quite straightforward, but if we have a batch of classes that need proxying with the same proxy functionality, we would need to implement an XxxProxy class for each one, which is very tedious.

### Dynamic Proxy in Java

Java provides a way to dynamically generate a proxy for a class. Let's look at an example:

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

In the example above, by implementing a single `InvocationHandler`, we can use `Proxy.newInstance` to create dynamic proxies with the same functionality for a batch of classes.
