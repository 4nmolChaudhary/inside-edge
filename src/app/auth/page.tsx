'use client'
import { useState } from 'react'
import Login from '@/components/auth/login'
import Register from '@/components/auth/register'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  return <div className='w-full h-full bg-[url(/images/bg-auth.png)] bg-cover bg-center'>{isLogin ? <Login onRegister={() => setIsLogin(false)} /> : <Register onLogin={() => setIsLogin(true)} />}</div>
}

export default Auth
