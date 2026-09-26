import { useMutation } from '@tanstack/react-query'
import { addPlayer } from '@/db/queries/players'
import { toast } from '@/components/ui/toast'

export const useAddPlayer = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: async (input: Parameters<typeof addPlayer>[0]) => {
      const result = await addPlayer(input)
      if (result.error) throw new Error(result.error)
      return result.player
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Adding player...', timeout: 0 }),
    onSuccess: (_player, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Player added', timeout: 4000 })
      onSuccess?.()
    },
    onError: (error, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}
