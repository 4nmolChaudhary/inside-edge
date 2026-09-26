import { useMutation } from '@tanstack/react-query'
import { authorize } from '@/lib/authorize'
import { toast } from '@/components/ui/toast'

export const useAuthorize = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: async (code: string) => {
      const authorized = await authorize(code)
      if (!authorized) throw new Error('Invalid code')
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Verifying code...', timeout: 0 }),
    onSuccess: (_data, _code, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Authorized', timeout: 4000 })
      onSuccess?.()
    },
    onError: (error, _code, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}
