'use client'
import { useId, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/form/button'
import { TextInput } from '@/components/form/text-input'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { authClient } from '@/lib/auth-client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { loginSchema } from '@/schemas/auth'

const Login = ({ onRegister }: { onRegister: () => void }) => {
  const id = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const toggleVisibility = () => setIsVisible(prevState => !prevState)

  const { register, handleSubmit, formState, reset } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const { errors } = formState

  useEffect(() => {
    reset()
    return () => {}
  }, [reset])

  const onSubmit = async (payload: { email: string; password: string }) => {
    console.log(payload)
    await authClient.signIn.email({ ...payload, callbackURL: '/' }, { onRequest: () => setLoading(true), onSuccess: () => setLoading(false), onError: () => setLoading(false) })
  }

  return (
    <div className='w-full p-6'>
      <h2 className='text-3xl md:text-6xl font-(family-name:--font-display) tracking-tight uppercase'>Login</h2>
      <span className='mb-4 text-center text-sm text-neutral-500 font-(family-name:--font-inter-tight)'>Enter your email below to login to your account</span>
      <form className='w-full' onSubmit={handleSubmit(onSubmit)}>
        <TextInput error={errors.email} {...register('email')} label='Email' placeholder='john@email.com' autoComplete='new-password' containerClasses='mt-2' />
        <TextInput error={errors.password} {...register('password')} id={id} label='Password' placeholder='*********' autoComplete='new-password' type={isVisible ? 'text' : 'password'} containerClasses='relative mb-4'>
          <button className={cn('text-muted-foreground/80 hover:text-foreground cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 absolute end-px top-2.5 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50', errors.password && 'top-1')} type='button' onClick={toggleVisibility} aria-label={isVisible ? 'Hide password' : 'Show password'} aria-pressed={isVisible} aria-controls='password'>
            {isVisible ? <EyeOffIcon size={16} aria-hidden='true' /> : <EyeIcon size={16} aria-hidden='true' />}
          </button>
        </TextInput>
        <Button type='submit' className='cursor-pointer w-full' text='Continue' loading={loading} loadingText='Signing In...' />
        <p className='mb-1 mt-3  text-center text-sm text-neutral-500'>
          <span className='font-(family-name:--font-inter-tight)'>
            {`Don't have an account?`}
            <button onClick={onRegister} type='button' className='font-medium ml-1 cursor-pointer text-neutral-300 underline-offset-2 outline-hidden hover:underline focus:underline'>
              Register
            </button>
          </span>
        </p>
      </form>
    </div>
  )
}

export default Login
