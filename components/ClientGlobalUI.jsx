"use client"

import SubscriptionModal from "@/components/SubscriptionModal"
import { useUser } from "@/contexts/UserContext"

export default function ClientGlobalUI() {
  const { showSubscriptionModal, setShowSubscriptionModal, isLimitReached, isAdmin } = useUser()

  return (
    <>
      {/* Global subscription modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Global feature gate overlay: blocks interactions when limit reached for non-admins */}
      {!isAdmin && isLimitReached && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setShowSubscriptionModal(true)}
        />
      )}
    </>
  )
}


