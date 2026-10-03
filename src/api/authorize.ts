import { useMutation } from '@tanstack/react-query'
import { authorize, deauthorize } from '@/lib/authorize'
import { toast } from '@/components/ui/toast'

export const useAuthorize = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: async (code: string) => {
      const result = await authorize(code)
      if (result === 'invalid') throw new Error('Invalid code')
      if (result === 'taken') throw new Error('Another user is already authorized')
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

// Releases the single authorization lock so another device can authorize.
export const useDeauthorize = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: () => deauthorize(),
    onMutate: () => toast.add({ type: 'loading', title: 'Logging out...', timeout: 0 }),
    onSuccess: (_data, _vars, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Logged out', timeout: 4000 })
      onSuccess?.()
    },
    onError: (_error, _vars, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: 'Could not log out', timeout: 5000, priority: 'high' })
    },
  })
}
