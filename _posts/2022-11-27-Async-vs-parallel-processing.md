---
title: "Async vs parallel processing"
date: 2022-11-27
layout: post
---
Imagine you are baking a cake and making a milkshake. You put the cake in the oven and realise it's going to take 2 hours to bake. Until the cake is in the oven, you smartly make the milkshake, and then come back to the oven and finish add the finishing touches to the cake. That's async processing. It's all about executing tasks in a non-blocking way. You don't need to sit there, bored and hungry, and wait while the cake bakes in the oven.

 Now picture the same situation as above, except this time, you are not alone. There's a second person with you preparing salad while you handle the cake and milkshake. That's parallel processing. In contrast to async processing, parallel processing is all about executing tasks concurrently.

The important thing to note is that you can even asynchronously execute tasks in a multithreaded environment; the second person preparing salad alongside you could also asynchronously execute their tasks.

So to reiterate, async processing is the idea of *executing tasks in a non-blocking way*, while parallel processing is the idea of *executing tasks concurrently*. They are different, but not mutually exclusive.
