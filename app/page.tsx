"use client"

import React,{useEffect} from 'react'
import { useRouter } from 'next/navigation'

import MelodiStream from '@/components/MelodiStream'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/spotify?endpoint=me')
      if (res.status === 307) {
        router.push('/api/auth/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <main>
      <MelodiStream />
    </main>
  )
}