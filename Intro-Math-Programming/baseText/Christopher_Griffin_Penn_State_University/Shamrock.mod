#
# This finds the optimal solution for McLearey
#

/* sets */
set DAY;
set DAY2;

/* parameters */
param makeCost {t in DAY};
param holdCost {t in DAY};
param demand {t in DAY};
param start;
param S;

/* decision variables: */
var x {t in DAY} >= 0;
var y {t in DAY} >= 0;

/* objective function */
minimize z: sum{t in DAY} (makeCost[t]*x[t]+holdCost[t]*y[t]);

/* Flow Constraints */
s.t. FLOWA : x[1] - y[1] = demand[1] - start;
s.t. FLOWB{t in DAY2} : x[t] + y[t-1] - y[t] = demand[t];

/* Manufacturing constraints */
s.t. MAKE{t in DAY} : x[t] <= S;


end;



