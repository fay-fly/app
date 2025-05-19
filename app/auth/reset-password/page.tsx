'use client';
import Logo from "@/icons/Logo";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import {FormEvent, useEffect, useState} from "react";
import axios from "axios";
import {useSearchParams} from "next/navigation";

function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    axios.post('/api/auth/reset-password', {
      token,
      newPassword: password,
    })
  }

  return (
    <form className="flex flex-col max-w-[424px] w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center">
        <Logo />
        <h1 className="mt-[16px] text-(--fly-text-secondary) text-[16px] font-bold">
          Reset Password ({token})
        </h1>
      </div>
      <div className="mt-[90px]">
        <p className="text-[14px] text-(--fly-text-secondary)">
          Make sure your password is at least 8 characters, with letters and numbers.
        </p>
        <FormInput
          type="password"
          label="New Password"
          placeholder="Create new password"
          required
          className="mt-[32px]"
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormInput
          type="password"
          label="Repeat new password"
          placeholder="Repaet password"
          required
          className="mt-[32px]"
        />
        <Button
          type="submit"
          className="mt-[32px] bg-(--fly-primary) text-(--fly-white)"
        >
          Confirm
        </Button>
      </div>
    </form>
  );
}

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token not provided.')
      setLoading(false)
      return
    }

    axios.get(`/api/auth/verify-reset?token=${encodeURIComponent(token)}`)
      .then(res => {
        if (res.data.valid) setValid(true)
        else setError(res.data.error || 'Invalid or expired token')
      })
      .catch(() => {
        setError('Could not verify token.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  if (loading) return <p>Checking reset link...</p>
  if (!valid) return <p style={{ color: 'red' }}>{error}</p>

  return token && <ResetPasswordForm token={token} />
}