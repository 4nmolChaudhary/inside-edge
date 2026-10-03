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

t type: b=bowled c=caught r=run out s=stumped h=hit wicket t=retired not out o=retired out (no LBW in gully cricket)

o who is out: s=striker n=non-striker

F fielder index in bowling squad (optional; catches / run outs / stumpings)

Examples

"0124" striker 0, non-striker 1, bowler 2, FOUR

"0120w1" wide, 1 extra

"0121n1" no-ball + 1 off the bat

"0120b2" 2 byes

"0120Wbs" bowled, striker out

"0121Wrn3" 1 run, non-striker run out, fielder 3

"0120Wts" striker retired NOT out on a delivery (not a wicket, can return)

"0120Wos" striker retired OUT on a delivery (a wicket, cannot return)

───────── NON-DELIVERY TOKENS (retirements) ─────────

R<i> batter at batting-squad index i retires NOT out (base36 i). Between balls.

X<i> batter at batting-squad index i retires OUT. Between balls.

"R0" batter 0 retires, can come back later

"X3" batter 3 retires out (counts as a wicket)

R / X add 0 runs and 0 balls, never touch over bookkeeping (overs, maidens, bowler change),
and are stored in the same ball-token array, so undo removes them like any other token.

───────── RETIRED BATTERS (gully rule) ─────────

- Retired NOT out (t / R) is NOT a wicket: no wicket in the team score, no fall of wickets,
  no credit to the bowler. The batter may return later.
- Retired OUT (o / X) IS a wicket (team score + fall of wickets, no bowler credit). The batter cannot return.
- A batter has one of four states: yet to bat, batting, retired, out.
- A returning batter continues the SAME scorecard entry: runs, balls, 4s and 6s accumulate.
  The batting order stays where they first appeared.
- New-batter choices = yet-to-bat players + retired-not-out players.
- All out = nobody is batting AND nobody is eligible (yet to bat or retired). A retired batter who never
  returns keeps the innings open; the scorer ends it manually.
- Last man standing: one batter left and nobody eligible, so they bat alone (striker = non-striker) and
  strike never rotates. If retired batters could still return, the scorer chooses: bring one back,
  or continue solo (the lone batter then bats with striker = non-striker).
- Retire is only allowed for a batter at the crease, never for the only batter left,
  and not while a new batter is still being chosen.
- Scorecard text: "retired not out" while retired; if they return and finish, "not out";
  if they return and get out, the normal dismissal text.
- player_stats: retired not out (never returned) = innings +1, outs +0. Retired out = innings +1, outs +1
  (never a duck). High score / not-out flag use the final innings state.

───────── PLAYER OF THE MATCH ─────────

Pure function: suggestPlayerOfMatch(match, replayInn1, replayInn2) in src/lib/scoring/potm.ts.
Every weight lives in the exported POTM_WEIGHTS constant.

- Batting: 1/run, +1/four, +2/six, +10 for 25+ (+20 for 50+; only the highest milestone applies).
  Strike-rate bonus only with 10+ balls: +5 if SR >= 150, -5 if SR < 75.
- Bowling: +20/wicket, +5/maiden, +1/dot ball.
  Economy bonus only with 2+ overs bowled: +10 if economy < 6, -5 if economy > 10.
- Fielding: +8 per catch, run out or stumping.
- Winning team: +10% of the player's total.
- Tie-break: points, then winning team, then wickets, then runs.

Flow:
- The award is AUTOMATIC: there is no manual pick or override, so it cannot be biased by the scorer.
- completeMatch (checks the authorization lock) saves the top-ranked player as matches.player_of_match_id
  and, in the same transaction as the stats upsert, adds 1 to player_stats.player_of_match.
- The confirmation screen only shows the winner, their points breakdown and the next three performers.
- The completed match page shows the POTM card (name, team, figures like "34 (18) & 2/12").


───────── TIE / SUPER OVER ─────────

- When innings 2 ends level (overs done or all out, runs equal), the scorer chooses: play a super over, or end as a tie
  (matches.winner_id null + completed = tie).
- Super over = one over each, same token format and engine (replayInnings with a 1-over limit).
  Innings 3 is batted by the team that batted 2nd in the match, innings 4 by the team that batted 1st (chasing innings 3 + 1).
- Storage: matches.super1_balls (innings 3) and matches.super2_balls (innings 4); matches.current_innings is 1-4.
  Undo works per innings like any other ball. endInnings moves 1 -> 2 and 3 -> 4; startSuperOver moves 2 -> 3 (only when tied).
- The super over is NOT in the team score cache (team_*_runs/wickets/balls) and NOT in player_stats; POTM is computed from
  the match innings only (the winning-team bonus uses the super over winner).
- The higher super over score wins ("Match tied. X won the super over (a/b v c/d)"). Level again = tied (no second super over).
