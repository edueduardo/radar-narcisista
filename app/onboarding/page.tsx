'use client'

import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push('/teste-clareza')
  }

  return <OnboardingWizard onComplete={handleComplete} />
}
