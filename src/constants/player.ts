export const USER_ROLES = {
  PLAYER: 'player',
  SCORER: 'scorer',
} as const

export const PLAYING_ROLES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALLROUNDER: 'allrounder',
  WICKETKEEPER: 'wicketkeeper',
} as const

export const BATTING_STYLES = {
  RIGHT_HAND: 'right_hand',
  LEFT_HAND: 'left_hand',
} as const

export const BOWLING_STYLES = {
  RIGHT_ARM_FAST: 'right_arm_fast',
  RIGHT_ARM_MEDIUM: 'right_arm_medium',
  RIGHT_ARM_OFF_SPIN: 'right_arm_off_spin',
  LEFT_ARM_FAST: 'left_arm_fast',
  LEFT_ARM_MEDIUM: 'left_arm_medium',
  LEFT_ARM_ORTHODOX: 'left_arm_orthodox',
  LEFT_ARM_CHINAMAN: 'left_arm_chinaman',
} as const
