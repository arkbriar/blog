---
title: "Game Theory -- Impartial Combinatorial Games"
published: 2017-10-11T00:40:08+08:00
draft: false
category: "Mathematics"
tags: ["game-theory", "sprague-grundy", "nim"]
---

Last time I said the upcoming posts would all be about graph algorithms... well, I lied.

I encountered game theory while solving problems, and I really knew nothing about this area, so it was time to learn. This article mainly covers Impartial Combinatorial Games within the domain of combinatorial games. The structure and content are referenced from the game theory lecture notes by Professor Thomas S. Ferguson at CMU, combined with my own thinking.


### Take-Away Games

A combinatorial game is a two-player game where each player has complete information, there are no random moves, and the outcome is always a win or a loss. Each step of the game consists of a move. Players typically alternate making moves until a terminal state is reached. A terminal state is one from which no legal move exists.

Clearly, the outcome of the game is determined from the very beginning. The result is completely determined by the set of game states, the initial state, and which player goes first.

There are two forms of combinatorial games. Here we mainly discuss one form: Impartial Combinatorial Games, hereafter abbreviated as ICG. In an ICG, the moves available to both players are identical. The other form, Partizan Combinatorial Games, is where the two players have different available moves -- for example, the well-known game of chess.

#### A Simple Take-Away Game

Let's look at a simple game:

1. Suppose we have two players, labeled I and II
2. Suppose there is a pile of chips on the table, 21 in total
3. Each move consists of taking 1, 2, or 3 chips from the pile
4. Starting with Player I, the two players take turns moving
5. The player who takes the last chip wins

This game is simple enough that it's easy to see Player I can always win. But if we change the number of chips to n, can we still determine who ultimately wins?

Clearly, if n is between 1 and 3, Player I can always win. Suppose there are currently n chips on the table and it is Player I's turn. Suppose Player I takes m chips, leaving n - m chips on the table.

Clearly, if Player II can determine that for all legal m, they can win in every n - m situation, then Player I must lose; otherwise Player I must win.

Note that Player II has the same complete information as Player I. So this is really asking whether Player I, going first, can win for all n - m situations. Obviously, a bottom-up or top-down dynamic programming approach can easily answer this question.

#### Combinatorial Game

Now let us formally define a combinatorial game:

1. A game between two players
2. The game has a state set representing all possible states during play, usually finite
3. The rules describe the legal moves from each state to the next; if the rules are the same for both players, the game is impartial; otherwise it is partizan
4. Players alternate moves
5. When a player moves to a state from which the next player has no legal move, the game ends;
    + Under normal play rules, the last player to move wins
    + The other convention is called the misere play rule, where the last player to move loses; this rule greatly increases the difficulty of analysis
6. No matter how the game is played, it always ends in a finite number of steps

Note that the game assumes both players are sufficiently intelligent, and no random moves are allowed.

#### P-positions, N-positions

In the simple Take-Away game above, the game state is the number of chips remaining on the table. As we can see, the number of remaining chips determines which player ultimately wins. More generally, the current state of the game determines the winning outcome.

For a game state, we define it as:

1. P-position: the **P**revious player (the one who just moved) can win, i.e., the second player to move wins
2. N-position: the **N**ext player (the one about to move) can win, i.e., the first player to move wins

In the above game, 1, 2, 3, 5, 6... are all N-positions, and 0, 4, 8, 12, 16... are all P-positions.

Clearly, by definition:

1. For every P-position, every legal move leads to an N-position
2. For every N-position, there exists a legal move that leads to a P-position

For the above game, the N/P labels for each state are as follows:

x | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | ...
:-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-:| :-: | :-:
position | P| N| N| N| P| N| N| N| P| N | ...

#### Subtraction Games

Let's look at a slightly harder problem. Let S be a set of positive integers and n be a large positive integer. Suppose there is a pile of chips on the table totaling n, and two players take turns removing x chips, where x must be some number in S. The player who takes the last chip wins.

Through N/P-position analysis, we can easily determine the outcome for all states.

### The Game of Nim

The most famous class of Take-Away games is the Nim game, with the following rules:

1. Suppose there are three piles of chips with x1, x2, x3 chips respectively
2. Two players take turns removing chips; each turn a player must take at least one chip from exactly one pile, and at most the entire pile
3. The player who takes the last chip wins

Nim is not necessarily played with three piles -- it can be any number. For convenience, we analyze the three-pile special case.

We represent the state as a triple (a, b, c), where each number represents the remaining chips in the corresponding pile.

Clearly, the terminal state is (0, 0, 0), which is a P-position.

1. For a single-pile Nim game (0, 0, x) where x > 0, the first player clearly wins, so it is an N-position.

2. For a two-pile Nim game, all states of the form (0, x, x) are P-positions, and all others are N-positions: suppose the initial state is (0, x, x), meaning the two piles are equal. The first player must take some chips, making the piles unequal. The second player can then take the same number of chips from the other pile to restore equality. Eventually the second player must win.

3. For a three-pile Nim game, simple analysis becomes difficult. Next we introduce an elegant analysis method that can easily analyze any Nim game.

#### Nim-Sum & Bouton's Theorem

For a Nim game with m piles, suppose the chip counts are x1, x2, x3 ... xm. Then (x1, x2, x3 ... xm) is a P-position if and only if x1 ^ x2 ^ x3 ... ^ xm = 0, where ^ denotes the XOR operation. The XOR sum here is called the **Nim-Sum**.

The above theorem is known as **Bouton's Theorem**.

First, let us note some properties of the XOR operation:

1. Self-inverse: x ^ x = 0
2. Associativity: a ^ (b ^ c) = (a ^ b) ^ c
3. Commutativity: a ^ b = b ^ a

Now let us prove the theorem. To prove it, we only need to verify the conditions for P and N-positions:

1. All terminal positions are P-positions. Since the only terminal position is (0, 0, ... 0), this is obvious.
2. For every N-position, there exists a move leading to a P-position. Suppose the current state is (x1, x2, x3 ..., xm) with Nim-Sum a = x1 ^ x2 ^ x3 ... ^ xm, and a is not 0. Let the highest bit of a be bit k. Then among x1, x2 ... xm, the number of values with a 1 in bit k is odd, meaning at least one such value exists. Without loss of generality, suppose it is x1. Let x1' be the number formed by keeping the bits of x1 above position k, setting bit k to 0, and appending the lower bits of a. Clearly x1' < x1, so moving from (x1, x2, x3 ..., xm) to (x1', x2, x3 ..., xm) is a legal move. Now x1' ^ x2 ^ x3 ... ^ xm = a ^ x1' ^ x1 = 0, so (x1', x2, x3 ..., xm) is a P-position.
3. For every P-position, every move leads to an N-position. This can be proved by contradiction.

Q.E.D.

#### Mis\`ere Nim

For Nim under the misere rule, Bouton gave the following strategy:

1. When there are still at least two piles with more than 1 chip, play the same as under normal rules
2. Otherwise there is only one pile with more than 1 chip remaining. Take from that pile to leave either 0 or 1 chip, ensuring an odd number of piles remain, each with exactly 1 chip, thus guaranteeing a win.

### Graph Games

Finally we reach this section, which introduces an important analytical tool for Impartial Combinatorial Games called the Sprague-Grundy function.

First, we convert the game into a directed graph G(X, F), where X is the set of all game states and F represents the move relations between states. For a state x, F(x) represents the set of legal next states, i.e., the set of moves.

If F(x) is empty for a node x, then x is a terminal node.

For analytical convenience, we assume such graph games are **progressively bounded**: there exists an integer n such that every path in the graph has length at most n.

#### Sprague-Grundy Function

Define the SG-function on graph G(X,F) as follows:

$g(x) = \min{\{n \ge 0: n \ne g(y)\ \textrm{for}\ y \in F(x)\}}$

That is, g(x) is the smallest non-negative integer not appearing among the SG-values of x's successors. We define an operation called the minimal excludant, abbreviated as mex, which gives the smallest non-negative integer not in a given set of non-negative integers. Then g(x) can be written as:

$g(x) = \mathrm{mex}{\{g(y): y \in F(x)\}}$

Note that g(x) is defined recursively. For a terminal node x, g(x) = 0.

#### The Use of the Sprague-Grundy Function

Let g be the SG-function on graph game G(X, F). We have the following properties:

1. If x is a terminal node, then g(x) = 0
2. If g(x) = 0, then for every successor y of x, g(y) != 0
3. If g(x) != 0, then there exists a successor y of x with g(y) = 0

These three conclusions follow directly from the definition of g.

Now we can say that for any node with g(x) = 0, the corresponding state x is a P-position, and all other nodes are N-positions.

In fact, the SG-function gives the winning path: the SG-value of the current state alternates to 0.

This theory can also be extended to **progressively finite** graphs: every path in the graph is finite.

### Sums of Combinatorial Games

Suppose we now have several combinatorial games and we want to combine them into one large game:

1. A player's move becomes: choose one of the non-terminated games and make a legal move
2. The terminal state is: all games have terminated

The resulting combined game is called the disjunctive sum of the games.

Suppose the games being combined are represented as graphs G1(X1, F1), G2(X2, F2) ..., Gn(Xn, Fn). We can combine them into a new graph G(X, F), where $X = X_1 \times X_2 \times \cdots \times X_n$ is the Cartesian product. Let x = (x1, ... xn), then
$F(x) = F(x_1, ..., x_n) = F_1(x_1) \times \{x_2\} \times \cdots \{x_n\} \cup \{x_1\} \times F_2(x_2) \times \cdots\{x_n\} \cup \cdots \{x_1\} \times \{x_2\} \times \cdots F_n(x_n)$

#### The Sprague-Grundy Theorem

In the combined graph game, we can compute the SG-function g as follows: let the original games' SG-functions be g1, g2, ..., gn. Then for x = (x1, x2, ..., xn), g(x) = g1(x1) ^ g2(x2) ^ ... gn(xn), i.e., the Nim-sum of the SG-values of the current states of the sub-games.

Let x = (x1, x2, ..., xn) be any point in the graph, and b = g1(x1) ^ g2(x2) ^ ... gn(xn). In fact, we only need to prove the following two points to establish the above conclusion:

1. For every non-negative integer a < b, there exists a successor y of x such that g(y) = a
2. No successor of x has value b

The proof here is similar to the Nim-sum proof in the previous section, and is left as an exercise.

In fact, in Nim, the SG-function for each pile is clearly g(n) = n, so the N/P-position determination in Nim is a special case of Sprague-Grundy.

We can also say that **every ICG is equivalent to some Nim game**.

### Green Hackenbush

Now let's introduce a combinatorial game called Hackenbush. The gist of this game is to chop edges from a rooted graph and remove any parts that become disconnected from the ground. The name "Hackenbush" is quite literal -- think of it as a game of hacking at bushes.

The impartial version of this game is called Green Hackenbush: every edge in the graph is green, and both players can chop any edge. The partizan version is called Blue-Red Hackenbush, where edges are either blue or red -- Player I can only chop blue edges, and Player II can only chop red edges. In the most general version, edges can be any of the three colors, with green edges being choppable by either player.

#### Bamboo Stalks

Let's first look at a simple special case of Green Hackenbush. In this case, each rooted connected component is a straight line, like a pillar, as shown below:

![Bamboo Stalks](/img/posts/bamboo_stalks.png)

Each move consists of choosing an edge, chopping it, and removing all parts no longer connected to the ground. Players alternate moves, and the last player to move wins.

Clearly, this game with n stalks is equivalent to a Nim game with n piles.

#### Green Hackenbush on Trees

As the name suggests, each bush looks like a tree:

![Green Hackenbush on Trees](/img/posts/green_hackenbush_on_trees.png)

By the theorem from the previous section, this game is equivalent to some version of Bamboo Stalks. We can perform the conversion using the following principle, more generally known as the Colon Principle:

+ When branches meet at a vertex, they can be replaced by a single stalk whose length is the **Nim-sum of the branch lengths**

![Colon Principle](/img/posts/colon_principle.png)

The proof of the Colon Principle should be relatively straightforward and is left as an exercise.

#### Green Hackenbush on General Rooted Graphs

Now let's consider arbitrary graphs, which may contain cycles, as shown below:

![Arbitrary Green Hackenbush](/img/posts/arbitrary_green_hackenbush.png)

Though the graph looks complex, each connected component can similarly be converted into a single pile in a Nim game. If we can convert each component into a tree, then we can use the method above to convert it into an equivalent pile.

Here we introduce a conversion method called the Fusion Principle: nodes on a cycle can be merged without changing the SG-function value of the graph.

As shown below, we can convert a gate-shaped cycle into a stalk of length 1:

![Fusion Principle Example](/img/posts/fusion_principle_ex1.png)

First, the two nodes on the ground can actually be merged into one node. Then, applying the fusion principle, this triangle is equivalent to three independent self-loops. Each self-loop is equivalent to a Nim pile of size 1, which ultimately combines into a single pile of size 1.

More generally, odd-length cycles can be converted into a single edge, and even-length cycles can be converted into a single point.

The proof of the fusion principle is rather long. Interested readers can refer to Chapter 7 of ***"Winning Ways"***.

### A Problem

Here is a concrete algorithm problem, Bob's Game. The original problem is at https://www.hackerrank.com/contests/university-codesprint-3/challenges/bobs-game/problem.

Problem summary:

> Bob invented a new game played on an n x n board. The rules are as follows:
>
> + Initially, there are some kings on the board. Multiple kings can occupy the same cell.
> + Kings can only move **up, left, or upper-left**
> + Some cells on the board are damaged, and kings cannot move onto damaged cells
> + Kings cannot move off the board
> + The game is played by two players who alternate turns
> + Each turn, a player moves one king
> + The last player to move wins
>
> Bob plays this game with his good friend Alice. Bob goes first. Given the initial state of the board, determine the number of first moves that guarantee Bob's victory. If Bob must lose, output LOSE.

If there is only one king on the board, this game can be easily analyzed using the SG-function to determine whether Bob wins and what his winning first move is.

Now there are multiple kings on the board, but the kings do not interfere with each other, so this game is the disjunctive sum of multiple single-king games. Applying the Sprague-Grundy theorem, we can derive the SG-function for this game.

### References

[1] http://www.cs.cmu.edu/afs/cs/academic/class/15859-f01/www/notes/comb.pdf
