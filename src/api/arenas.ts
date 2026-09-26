import { useMutation } from '@tanstack/react-query'
import { verifyArenaCode } from '@/db/queries/arenas'
import { toast } from '@/components/ui/toast'

export const useVerifyArenaCode = ({ onSuccess }: { onSuccess?: (arena: { id: string; code: string }) => void } = {}) => {
  return useMutation({
    mutationFn: async (code: string) => {
      const verified = await verifyArenaCode(code)
      if (!verified) throw new Error('Invalid arena code')
      return verified
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Joining arena...', timeout: 0 }),
    onSuccess: (arena, _code, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Arena joined', timeout: 4000 })
      onSuccess?.(arena)
    },
    onError: (error, _code, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}
