import { useMutation, useQuery } from '@tanstack/react-query'

import { getUsers, updateUser } from '@/db/queries/users'

import { UpdateUserInput } from '@/types/user'

export const useUpdateUser = (props: { onSuccess?: () => void; onError?: () => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: UpdateUserInput) => updateUser(id, updates),
    ...props,
  })
}

export const useUsers = () => {
  return useQuery({ queryKey: ['users'], queryFn: getUsers })
}
