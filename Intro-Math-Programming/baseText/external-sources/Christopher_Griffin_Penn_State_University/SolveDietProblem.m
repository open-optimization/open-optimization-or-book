%%Solve the Diet Linear Programming Problem
c = [1 1.5]';
A = [[-2 -3];...
     [-1 -2]];
b = [-20 -12]';
H = [];
r = [];
l = [0 0]';
u = [];
[x obj] = linprog(c,A,b,H,r,l,u);