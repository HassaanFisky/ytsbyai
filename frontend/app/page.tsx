"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import dynamic from "next/dynamic"

const LandingPage = dynamic(() => import("@/components/LandingPage"), { ssr: false })

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.push("/app")
      }
    })
    return () => unsubscribe()
  }, [router])

  return <LandingPage />
} 
