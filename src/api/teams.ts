import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTeam, getTeamsByArena } from '@/db/queries/teams'
import { toast } from '@/components/ui/toast'

export const useTeams = (arenaId?: string) => {
  return useQuery({
    queryKey: ['teams', arenaId],
    queryFn: () => getTeamsByArena(arenaId!),
    enabled: !!arenaId,
  })
}

export const useAddTeam = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Parameters<typeof addTeam>[0]) => {
      const result = await addTeam(input)
      if (result.error) throw new Error(result.error)
      return result.team
    },
    onMutate: () => toast.add({ type: 'loading', title: 'Adding team...', timeout: 0 }),
    onSuccess: (_team, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'success', title: 'Team added', timeout: 4000 })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      onSuccess?.()
    },
    onError: (error, _input, toastId) => {
      if (toastId) toast.update(toastId, { type: 'error', title: error.message, timeout: 5000, priority: 'high' })
    },
  })
}
