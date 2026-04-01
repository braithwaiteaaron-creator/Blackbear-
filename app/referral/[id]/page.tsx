'use client'

import { useSearchParams } from 'next/navigation'
import ReferralPage from '@/app/referral/page'

export default function DynamicReferralPage() {
  const searchParams = useSearchParams()
  const referrerName = searchParams.get('referrer') || 'Clayton Curtiss'
  const referrerId = searchParams.get('id') || 'clayton-001'

  return <ReferralPage referrerName={referrerName} referrerId={referrerId} />
}
