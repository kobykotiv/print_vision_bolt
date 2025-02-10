import { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Login - Print Vision Bolt',
  description: 'Login to your Print Vision Bolt account',
}

export default function LoginPage() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
