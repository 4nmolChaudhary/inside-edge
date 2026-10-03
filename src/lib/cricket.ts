export const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`

export const formatMatchDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' }).format(date).toUpperCase()

export const formatMatchDateTime = (date: Date) => `${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(date).toUpperCase()} IST`
