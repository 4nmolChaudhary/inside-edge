@AGENTS.md

───────── BALL TOKEN FORMAT ─────────

<S><N><B><R>[<E><e>]W<t><o>[<F>]]

S striker index in batting squad array (base36 char: 0-9, a-z)

N non-striker index in batting squad array (base36)

B bowler index in bowling squad array (base36)

R runs off the bat (0-7)

E extra type: w=wide n=no-ball b=bye l=leg-bye (omit if none)

e extra runs (digit, e.g. w1, n1, b2)

W wicket marker, followed by:

t type: b=bowled c=caught l=lbw r=run out s=stumped h=hit wicket t=retired

o who is out: s=striker n=non-striker

F fielder index in bowling squad (optional; catches / run outs / stumpings)

Examples

"0124" striker 0, non-striker 1, bowler 2, FOUR

"0120w1" wide, 1 extra

"0121n1" no-ball + 1 off the bat

"0120b2" 2 byes

"0120Wbs" bowled, striker out

"0121Wrn3" 1 run, non-striker run out, fielder 3

