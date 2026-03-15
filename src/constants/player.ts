export const USER_ROLES = {
  PLAYER: 'player',
  SCORER: 'scorer',
} as const

export const PLAYING_ROLES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALLROUNDER: 'all_rounder',
  WICKETKEEPER: 'wicket_keeper',
} as const

export const BATTING_STYLES = {
  RIGHT_HAND: 'right_handed',
  LEFT_HAND: 'left_handed',
} as const

export const BOWLING_STYLES = {
  RIGHT_ARM_FAST: 'right_arm_fast',
  RIGHT_ARM_MEDIUM: 'right_arm_medium',
  RIGHT_ARM_OFF_SPIN: 'right_arm_off_spin',
  RIGHT_ARM_LEG_BREAK: 'right_arm_leg_break',
  LEFT_ARM_FAST: 'left_arm_fast',
  LEFT_ARM_MEDIUM: 'left_arm_medium',
  LEFT_ARM_ORTHODOX: 'left_arm_orthodox',
  LEFT_ARM_CHINAMAN: 'left_arm_chinaman',
} as const
