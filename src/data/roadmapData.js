export const roadmapData = [
  {
    id: "stage-1",
    level: "Beginner",
    levelColor: "#10b981",
    title: "Stage 1: Foundations & STL",
    description: "Master basic language constructs, C++ STL, complexity analysis, and essential math fundamentals.",
    topics: [
      {
        id: "cpp-basics-stl",
        name: "C++ Basics & STL",
        summary: "Vectors, pairs, sets, maps, iterators, comparator functions, and fast I/O.",
        resources: [
          { name: "USACO Guide - C++ STL", url: "https://usaco.guide/bronze/intro-complete" },
          { name: "CP-Algorithms - Fast I/O", url: "https://cp-algorithms.com/" }
        ],
        problems: [
          { id: "p101", title: "Vector-Sort", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/vector-sort/problem" },
          { id: "p102", title: "Watermelon (4A)", platform: "Codeforces", difficulty: "800", url: "https://codeforces.com/problemset/problem/4/A" },
          { id: "p103", title: "Way Too Long Words (71A)", platform: "Codeforces", difficulty: "800", url: "https://codeforces.com/problemset/problem/71/A" },
          { id: "p104", title: "Team (231A)", platform: "Codeforces", difficulty: "800", url: "https://codeforces.com/problemset/problem/231/A" }
        ]
      },
      {
        id: "time-space-complexity",
        name: "Time & Space Complexity",
        summary: "Big-O notation, calculating operations per second (~10^8 in 1s), and memory bounds.",
        resources: [
          { name: "USACO Guide - Time Complexity", url: "https://usaco.guide/bronze/time-comp" }
        ],
        problems: [
          { id: "p105", title: "Weird Algorithm", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1068" },
          { id: "p106", title: "Missing Number", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1083" },
          { id: "p107", title: "Repetitions", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1069" }
        ]
      },
      {
        id: "basic-math-number-theory",
        name: "Basic Math & Number Theory",
        summary: "GCD (Euclidean Algorithm), LCM, Prime Sieve of Eratosthenes, and Modular Arithmetic.",
        resources: [
          { name: "CP-Algorithms - Sieve of Eratosthenes", url: "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html" },
          { name: "CP-Algorithms - Euclidean Algorithm", url: "https://cp-algorithms.com/algebra/euclid-algorithm.html" }
        ],
        problems: [
          { id: "p108", title: "Counting Divisors", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1713" },
          { id: "p109", title: "Exponentiation", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1095" },
          { id: "p110", title: "Almost Prime (26A)", platform: "Codeforces", difficulty: "900", url: "https://codeforces.com/problemset/problem/26/A" }
        ]
      }
    ]
  },
  {
    id: "stage-2",
    level: "Intermediate",
    levelColor: "#3b82f6",
    title: "Stage 2: Core Problem-Solving Techniques",
    description: "Essential algorithmic patterns for Codeforces Div. 3 & Div. 2 (Rating 1000–1400).",
    topics: [
      {
        id: "binary-search",
        name: "Binary Search & BS on Answer",
        summary: "Standard binary search, std::lower_bound, std::upper_bound, and monotonic predicate functions.",
        resources: [
          { name: "Errichto - Binary Search Tutorial", url: "https://www.youtube.com/watch?v=GU7DpgHINWQ" },
          { name: "CP-Algorithms - Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html" }
        ],
        problems: [
          { id: "p201", title: "Binary Search", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/" },
          { id: "p202", title: "Factory Machines", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1620" },
          { id: "p203", title: "Pipeline (287B)", platform: "Codeforces", difficulty: "1400", url: "https://codeforces.com/problemset/problem/287/B" },
          { id: "p204", title: "Array Division", platform: "CSES", difficulty: "1400", url: "https://cses.fi/problemset/task/1085" }
        ]
      },
      {
        id: "two-pointers-sliding-window",
        name: "Two Pointers & Sliding Window",
        summary: "Opposite ends, same direction scans, fixed-size and variable-size window optimization.",
        resources: [
          { name: "USACO Guide - Two Pointers", url: "https://usaco.guide/silver/two-pointers" }
        ],
        problems: [
          { id: "p205", title: "Sum of Two Values", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1640" },
          { id: "p206", title: "Subarray Sums I", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1660" },
          { id: "p207", title: "Books (279B)", platform: "Codeforces", difficulty: "1100", url: "https://codeforces.com/problemset/problem/279/B" }
        ]
      },
      {
        id: "prefix-sums",
        name: "Prefix Sums & Difference Arrays",
        summary: "O(1) range sum queries in 1D and 2D arrays, and range add operations with difference arrays.",
        resources: [
          { name: "USACO Guide - Prefix Sums", url: "https://usaco.guide/silver/prefix-sums" }
        ],
        problems: [
          { id: "p208", title: "Static Range Sum Queries", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1646" },
          { id: "p209", title: "Subarray Divisibility", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1662" },
          { id: "p210", title: "Kuriyama Mirai's Stones (433B)", platform: "Codeforces", difficulty: "1100", url: "https://codeforces.com/problemset/problem/433/B" }
        ]
      },
      {
        id: "greedy-sorting",
        name: "Greedy Algorithms & Sorting Customization",
        summary: "Exchange arguments, interval scheduling, custom sorting comparators.",
        resources: [
          { name: "USACO Guide - Greedy Algorithms", url: "https://usaco.guide/silver/greedy" }
        ],
        problems: [
          { id: "p211", title: "Movie Festival", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1629" },
          { id: "p212", title: "Towers", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1073" },
          { id: "p213", title: "Chat Room (58A)", platform: "Codeforces", difficulty: "1000", url: "https://codeforces.com/problemset/problem/58/A" }
        ]
      }
    ]
  },
  {
    id: "stage-3",
    level: "Advanced",
    levelColor: "#8b5cf6",
    title: "Stage 3: Graph Algorithms & Dynamic Programming",
    description: "Advanced paradigms for competitive programming mastery (Codeforces Div. 2C/D/E and beyond).",
    topics: [
      {
        id: "graphs-dfs-bfs",
        name: "Graph Traversals (BFS, DFS, Dijkstra)",
        summary: "Adjacency lists, connected components, bipartite testing, topological sort, and shortest paths.",
        resources: [
          { name: "CP-Algorithms - Breadth First Search", url: "https://cp-algorithms.com/graph/breadth-first-search.html" },
          { name: "CP-Algorithms - Dijkstra Algorithm", url: "https://cp-algorithms.com/graph/dijkstra.html" }
        ],
        problems: [
          { id: "p301", title: "Counting Rooms", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1192" },
          { id: "p302", title: "Labyrinth", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1193" },
          { id: "p303", title: "Shortest Routes I (Dijkstra)", platform: "CSES", difficulty: "1400", url: "https://cses.fi/problemset/task/1671" },
          { id: "p304", title: "Course Schedule (Topo Sort)", platform: "CSES", difficulty: "1400", url: "https://cses.fi/problemset/task/1679" }
        ]
      },
      {
        id: "trees-dsu",
        name: "Trees & Disjoint Set Union (DSU)",
        summary: "Tree traversals, finding diameter/subtrees, DSU with path compression and union by rank, Kruskal MST.",
        resources: [
          { name: "CP-Algorithms - Disjoint Set Union", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html" },
          { name: "USACO Guide - Trees", url: "https://usaco.guide/silver/tree-traversals" }
        ],
        problems: [
          { id: "p305", title: "Subordinates", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1674" },
          { id: "p306", title: "Road Construction (DSU)", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1676" },
          { id: "p307", title: "Road Reparation (MST)", platform: "CSES", difficulty: "1500", url: "https://cses.fi/problemset/task/1675" }
        ]
      },
      {
        id: "dynamic-programming",
        name: "Dynamic Programming (1D, 2D, Knapsack)",
        summary: "State formulation, transitions, base cases, memoization vs tabulation, sub-problems.",
        resources: [
          { name: "Errichto - Dynamic Programming Tutorial", url: "https://www.youtube.com/watch?v=YBSt1jYwVfU" },
          { name: "CSES Dynamic Programming List", url: "https://cses.fi/problemset/list/" }
        ],
        problems: [
          { id: "p308", title: "Dice Combinations", platform: "CSES", difficulty: "Easy", url: "https://cses.fi/problemset/task/1633" },
          { id: "p309", title: "Coin Combinations I", platform: "CSES", difficulty: "Medium", url: "https://cses.fi/problemset/task/1635" },
          { id: "p310", title: "Book Shop (0/1 Knapsack)", platform: "CSES", difficulty: "1300", url: "https://cses.fi/problemset/task/1158" },
          { id: "p311", title: "Edit Distance", platform: "CSES", difficulty: "1500", url: "https://cses.fi/problemset/task/1639" }
        ]
      }
    ]
  }
];
