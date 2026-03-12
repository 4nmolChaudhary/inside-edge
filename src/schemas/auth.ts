import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email !' }),
  password: z.string().min(1, { message: 'Password is required !' }),
})

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required !' }),
  email: z.string().email({ message: 'Enter a valid email !' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long !' }),
})
