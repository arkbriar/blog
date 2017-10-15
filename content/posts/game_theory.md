---
title: "Game Theory"
date: 2017-10-11T00:40:08+08:00
draft: false
categories: ["Mathematics", "Game Theory"]
tags: ["math", "game theory"]
toc: true
comments: true
---

上回说到接下来都是图算法... 这个，我食个言 🙃

做题目碰到了博弈论，对这方面我真是完全不了解，还是要学习一个。本篇文章主要介绍组合游戏中的 Impartial Combinatorial Games，结构和内容均参考自 CMU Thomas S. Ferguson 教授的博弈论讲稿，结合我自己的思考。

### Take-Away Games

组合游戏是指一种两个玩家的游戏，每个玩家都有着完全的信息，不存在随机动作，游戏的结果总是赢或者输。游戏的每一个步骤由一个移动构成，通常玩家会交替地进行移动，直到达到终止状态。终止状态是指从该状态不存在任何一个状态移动方式的状态。

显然，游戏的结果从一开始就被决定了，结果由游戏的状态集合、游戏初始状态以及玩家的先后手完全确定。

组合游戏的形式有两种，这里我们主要讨论其中的一种游戏形式 Impartial Combinatorial Games，以下简称 ICG。ICG 是指在游戏中，两个玩家所能进行的移动是完全相同的。对应的另一种形式 Partizan Combinatorial Games 就是指两个玩家分别有不同的移动，比如说我们熟知的象棋。

#### A Simple Take-Away Game

我们来看一个简单的小游戏：

1. 假设我们有两个玩家，标记为 I 和 II
2. 假设桌子上有一堆碎片，总计21个
3. 每一次移动对应于从碎片堆中取出1或2或3个碎片
4. 从玩家 I 开始，两个玩家轮流移动
5. 最后一个移走碎片的玩家获胜

这个游戏足够简单，很容易就得知玩家I总是能获胜。但是如果我们把碎片数目改成 n，我们是否也能确定最终是谁获胜呢？

显然，如果n在1到3之间，玩家 I 总是能获胜。假设现在场上的碎片数是n，并且是玩家 I 的回合。那么假设玩家 I 取走了m片碎片，场上剩余 n - m 片碎片。

显然，如果玩家 II 能够确定对所有合法的 m，他能够在所有 n - m 的情况下都必胜，那么玩家 I 必败，否则玩家 I 必胜。

注意到这里玩家 II 和玩家 I 一样拥有完全的信息，其实也就是问先手条件下的玩家 I 能不能对所有 n - m 都必胜，那么显然一个 bottom-up 或者 top-down 的动态规划能很容易地回答上述问题。

#### Combinatorial Game

现在我们来形式化地定义一个组合游戏：

1. 两个玩家构成的游戏
2. 游戏有一个状态集合，表示游戏过程中所有可能状态，通常是有穷的
3. 游戏的规则描述了在某个状态下玩家移动到下一个状态的合法移动，如果规则对两个玩家是相同的，就是 impartial 的，否则是 partizan 的
4. 玩家交替移动
5. 当玩家移动到一个状态，下一个移动的玩家没有可行的移动时，游戏结束；
    + 在通常的游戏规则下，最后一个移动的玩家获胜
    + 另一种规则叫做 mis\`ere play rule，最后一个移动的玩家失败；这个规则极大地提高的分析的难度
6. 游戏无论怎么进行，始终能在有限步内结束

注意游戏假设两个玩家都是足够聪明的玩家，不允许任何随机移动的存在。

#### P-positions，N-positions

在上述简单的 Take-Away 游戏里，游戏的状态就是桌子上剩余的碎片数。可以看到，桌子上剩余的碎片数决定了哪个玩家能够最终获胜。更普遍的，游戏的当前状态决定了玩家的获胜情况。

对于一个游戏状态，我们定义它为

1. P-position，在该状态，上一个移动的玩家(**P**revious player)能够获胜，也就是后手必胜
2. N-position，在该状态，下一个移动的玩家(**N**ext player)能够获胜，也就是先手必胜

上述游戏中，1、2、3、5、6 ... 都是 N-position，0、4、8、12、16 ...都是 P-position。

显然，由定义可知：

1. 对于每一个 P-position，对于任何一个合法的移动下的下一个状态一定是一个 N-position
2. 对于每一个 N-position，一定存在一个合法移动，使得下一个状态是 P-position

对于上述的游戏，状态对应的 N、P 如下：

x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | ...
:-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-: | :-:
position | P| N| N| N| P| N| N| N| P| N | ...

#### Subtraction Games

我们来看一个更难一点的问题。令 S 是一个正整数的集合，n 是一个比较大的正整数。假设桌上有一堆碎片，总计n个，两个玩家轮流从中取出x个，这里x必须是S中的某个数，最后取的玩家获胜。

通过状态对应的 N、P 分析，我们可以轻松的得出所有状态下结果。

### The Game of Nim

Take-Away 游戏中最出名的一类游戏叫做 Nim 游戏，它的游戏规则如下：

1. 假设现在有三堆碎片，分别为 x1, x2, x3
2. 两个玩家轮流取碎片，每次必须从其中的一堆取至少一个碎片，最多不能超过选择的堆
3. 最后一个取碎片的玩家获胜

Nim 游戏不一定是三堆的，可以使其他的数目，为了方便起见，我们用三堆的特例来分析。

我们将状态表示为一个三元对 (a, b, c)，每个数表示对应的堆剩余的碎片数。

显然，终止状态是 (0, 0, 0)，它是一个 P-pos。

1. 对于只剩一个一堆的 Nim 游戏 (0, 0, x), x > 0，显然先手必胜，也就是一个 N-pos。

2. 对于两堆的 Nim 游戏，所有 (0, x, x) 的点都是 N-pos，其余点都是 P-pos：假设初始状态为 (0, x, x)，也就是说两堆相等，先手的玩家必须取走一些碎片，使得场上碎片数不相等，后手的玩家通过取走另一堆里相同数目的碎片可以恢复场上相等的条件，最终后手玩家一定胜利。

3. 对于三堆的 Nim 游戏，就很难做一个简单分析了，接下去我们将介绍一个优美的分析方法，它将轻易的分析任意 Nim 游戏。

#### Nim-Sum & Bouton's Theorem

对于一个有 m 个堆的 Nim 游戏，假设场上碎片数为 x1, x2, x3 ... xm，那么 (x1, x2, x3 ... xm) 是一个 P-pos 当且仅当 x1 ^ x2 ^ x3 ... ^ xm = 0，这里 ^ 为异或操作，异或和在这里被称为是 **Nim-Sum**。

上述定理被称为是 **Bouton's Theorem**。

这里先介绍几个异或操作的性质：

1. 自反，x ^ x = 0
2. 结合律，a ^ (b ^ c) = (a ^ b) ^ c
3. 交换律，a ^ b = b ^ a

下面我们来证明上述定理。对该定理的证明，我们只需要验证上述 P、N -pos 的几个条件就可以了：

1. 所有终止点都是 P-pos，因为我们只有终止点 (0, 0, ... 0)，所以显然。
2. 对每个 N-pos，存在一个移动使得下一个状态时是P-pos。假设当前状态为 (x1, x2, x3 ..., xm), Nim-Sum 为 a = x1 ^ x2 ^ x3 ... ^ xm，且 a 不等于 0。假设 a 的二进制最高位为第 k 位，那么 x1, x2 ... xm 所有数中第 k 位为 1 的数的个数是奇数，也就是说其中一定存在一个数，第 k 位为 1。不失一般性，假设是 x1。那么令 x1' 为 x1 在 k 之后的高位、k位 为 0、a 在 k 之后的地位拼接而成的数，显然 x1' < x1，所以 (x1, x2, x3 ..., xm) 到 (x1', x2, x3 ..., xm) 是一个合法的移动。此时 x1' ^ x2 ^ x3 ... ^ xm = a ^ x1' ^ x1 = 0，(x1', x2, x3 ..., xm) 是一个 P-pos。
3. 对每个 P-pos，每一个移动都是到 N-pos。这里反证就行。

证毕。

#### Mis\`ere Nim

对于 Mis\`ere 规则下的 Nim 游戏，Bouton 给出了玩法：

1. 当前场上还有至少两堆大于1的碎片时，和正常规则一样移动
2. 否则场上只剩一堆大于1的碎片，从这一堆里取，使得堆里剩余0或者1个碎片，从而保证场上还剩奇数个堆，每个堆只有一个1碎片，从而必胜。

### Graph Games

终于介绍到这里了，这一节将介绍一种 Impartial Combinatorial Games 中的重要的分析手段，叫做 Sprague-Grundy function。

首先我们先把游戏转换成一个有向图G(X, F)，其中 X 是游戏中所有状态的集合，F 表示状态之间的移动关系，令 x 表示一个状态，那么 F(x) 表示在 x 状态下的下一个合法状态，也就代表了移动的集合。

如果对于节点x，F(x) 是空集，那么 x 就是一个终止节点。

为了分析方便起见，我们假设这样的图游戏是**渐进有界**的：存在一个整数n，使得图上任何一条路径是的长度不超过n。

#### Sprague-Grundy Function

定义图 G(X,F) 上的 SG-函数为如下形式：

`$g(x) = \min{\{n \ge 0: n \ne g(y)\ \textrm{for}\ y \in F(x)\}}$`

也就是说，g(x) 代表了在 x 的后继节点的 SG-函数中没有出现的第一个非负整数。我们定义一个操作叫做 minimal excludant, 简写为 mex，为给出不出现在一个非负整数集合中的第一个非负整数，那么 g(x) 可以写成如下形式：

`$g(x) = \mathrm{mex}{\{g(y): y \in F(x)\}}$`

注意到 g(x) 是递归定义的，对终止节点x，g(x) = 0。

#### The Use of the Sprague-Grundy Function

令 g 为图游戏 G(X, F) 上的 SG-函数，我们有如下性质：

1. x是终止节点，那么 g(x) = 0
2. g(x) = 0，那么对于 x 每个后继节点 y，g(y) != 0
3. g(x) != 0，那么存在一个 x 的后继节点 y，g(y) = 0

根据 g 的定义，上述三条结论是显然的。

现在我们可以说，对于任意 g(x) = 0 的节点，x 对应的状态为一个 P-pos，其余的节点都为 N-pos。

事实上，SG-函数给出了获胜的路径：当前状态的 GF-函数交替变为 0。

该理论也可以推广到**渐进有穷**的的图上：图的每一条路径都是有穷的。

### Sums of Combinatorial Games

假设我们现在有几个组合游戏，我们打算把它合并成一个大游戏：

1. 玩家的移动变为：选择其中一个未终止的游戏，进行一次合法移动
2. 终止状态为：所有游戏都终止了

这样合并出来的游戏被称为游戏的 disjunctive sum。

假设我们所合并的游戏分别表示为图 G1(X1, F1)，G2(X2, F2) ...，Gn(Xn, Fn)，我们可以把它们合并成一张新的图 G(X, F)，其中 `$X = X_1 \times X_2 \times \cdots \times X_n$` 为笛卡尔乘积；令 x = (x1, ... xn)
，则 
`$F(x) = F(x_1, ..., x_n) = F_1(x_1) \times \{x_2\} \times \cdots \{x_n\} \cup \{x_1\} \times F_2(x_2) \times \cdots\{x_n\} \cup \cdots \{x_1\} \times \{x_2\} \times \cdots F_n(x_n)$`

#### The Sprague-Grundy Theorem

合并后的图游戏中，我们可以通过以下方式给出图上的 SG-函数 g：假设原来游戏的 SG-函数分别为 g1, g2, ..., gn，那么对于 x = (x1, x2, ..., xn)，g(x) = g1(x1) ^ g2(x2) ^ ... gn(xn)，也就是子游戏当前状态的 SG-函数的 Nim-和。

令 x = (x1, x2, ..., xn) 为图上任意一点，b = g1(x1) ^ g2(x2) ^ ... gn(xn) ，事实上我们只需要证明如下两点就可以得出上述结论：

1. 对每个非负整数 a < b，存在一个 x 的后继 y，使得 g(y) = a
2. 任意 x 的后继不为 b

此处证明与上一节 Nim 和的证明类似，就留作习题吧。

事实上，Nim 游戏中，显然每堆的 SG-函数 g(n) = n，所以 Nim 游戏判断 N、P-pos 是 Sprague-Grundy 的一个特例。

也可以说，**任意ICG都等价于某个Nim游戏**。

### Green Hackenbush

下面介绍一个组合游戏，叫做 Hackenbush ，这个游戏的大意是从一个有根的图上砍下一些边，并移除不接地的部分。额，直译有点难，这里hack翻译为砍，bush是灌木，从 Hackenbush 这个游戏名的字面上理解就行了，就是砍灌木丛的游戏。

这个游戏的 impartial 版本叫做 Green Hackenbush：图上的每条边都是绿色的，两个玩家都能砍任意边。Partizan 版本的游戏叫做 Blue-Red Hackenbush，其中图上的边有蓝色和红色之分，玩家 I 只能砍蓝色的，而玩家 II 只能砍红色的。更为一般的版本中，边有上述三种，绿色是都能砍的。

#### Bamboo Stalks

先看一个简单的 Green Hackenbush 的特例，这个特例里，每个有根的联通分支都是一条直线，就跟柱子一样，如下图所示：

![Bamboo Stalks](/img/posts/bamboo_stalks.png)

每一次移动就是选取其中一条边，砍断它并移除所有不连到地面的部分。玩家交替进行移动，最后一个移动的玩家胜利。

显然，有n根柱子的这个游戏和有n堆的nim游戏是等价的。

#### Green Hackenbush on Trees

顾名思义，每棵灌木长的和树一样：

![Green Hackenbush on Trees](/img/posts/green_hackenbush_on_trees.png)

由上一节的定理，这个游戏等价于某个版本的 Bamboo Stalks。我们可以通过以下原则来进行转换，更为普遍地，叫做 Colon Principle：

+ 当分支交汇于某个顶点时，可以用一条长度为**分支长度 nim-和**的杆来代替

![Colon Principle](/img/posts/colon_principle.png)

Colon Principle 的证明应该比较简单，这里留作思考。

#### Green Hackenbush on general rooted graphs

现在我们来考虑任意的图，这些图中可能存在环等，如下所示：

![Arbitrary Green Hackenbush](/img/posts/arbitrary_green_hackenbush.png)

这图看着复杂，其实同样对于每个联通分支都可以转换为 Nim 游戏中的一个堆。考虑如果能将每个分支转换成一棵树，那就可以用上面的方法转换成等价的堆了。

这里介绍一种转换方式，叫做 Fusion Principle：
在不改变图上 SG-函数值的情况下，回路上的点可以进行合并。

如下图所示，我们可以将门形状的回路转换为长度为1的杆：

![Fusion Principle Example](/img/posts/fusion_principle_ex1.png)

首先，地上的两个点事实上可以合并成一个点；然后应用fusion principle，这个三角形等价于三个独立的自环；而每个自环又等价于一个大小为1的nim堆，最终合并为一个大小为1的堆。

更一般地，奇数长度的回路都可以转换为一条边，偶数长度的回路转换为一个点。

关于 fusion principle 的证明比较长，有兴趣的同学可以参考 _**《Winning Ways》**_ 的第七章。

### A Problem

这里给出一个具体的算法问题 Bob's Game，原题在 https://www.hackerrank.com/contests/university-codesprint-3/challenges/bobs-game/problem 。

题目大意：

> Bob 发明了一个新游戏，这个游戏在一个 n x n 的棋盘上进行。游戏的规则如下：
> 
> + 一开始，棋盘上有一些国王。一个格子中可以存在多个国王。
> + 国王只允许向**上、左、左上**移动
> + 棋盘上有些格子损坏了，国王不能移动到损坏的格子上
> + 国王不能移出棋盘
> + 游戏由两个玩家进行，他们交替进行操作
> + 玩家每次操作移动一个国王
> + 最后一个移动的玩家获胜
> 
> Bob 和他的好朋友 Alice 玩这个游戏，Bob 先手。假设给定棋盘的初始状态，给出 Bob 一定能获胜的第一步移动的数目；如果 Bob 必败，输出 LOSE。

假设棋盘上只有一个国王，这个游戏通过 SG-函数很容易分析 Bob 是否必胜，以及必胜的第一步操作。

现在场上存在多个国王，但是国王之间互相不干扰，所以这个游戏是由多个单国王的游戏合并而成的。应用 Sprague-Grundy 定理，我们可以推导出这个游戏的 SG-函数。

### References

[1] http://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/comb.pdf