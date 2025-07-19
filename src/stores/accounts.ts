import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/api/accounts'
import type { Account } from '@/types/accounts'
import { toast } from 'vue-sonner'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const isLoading = ref(false)

  const handleApiError = (err: unknown, action: string) => {
    console.error(`Ошибка при ${action}:`, err)
    toast('Ошибка', { description: `Не удалось ${action}` })
  }

  const load = async (): Promise<void> => {
    isLoading.value = true
    try {
      const { data } = await api.GET_ACCOUNTS()
      accounts.value = data
    } catch (err) {
      handleApiError(err, 'загрузке аккаунтов')
    } finally {
      isLoading.value = false
    }
  }

  const add = async (account: Account): Promise<Account | null> => {
    try {
      const { data } = await api.ADD_ACCOUNTS(account)
      accounts.value.push(data)
      toast('Успешно', { description: 'Аккаунт добавлен' })
      return data
    } catch (err) {
      handleApiError(err, 'добавлении аккаунта')
      return null
    }
  }

  const update = async (account: Account): Promise<void> => {
    try {
      await api.UPDATE_ACCOUNTS(account)
      const index = accounts.value.findIndex(a => a.id === account.id)
      if (index !== -1) accounts.value[index] = account
      toast('Успешно', { description: 'Аккаунт обновлён' })
    } catch (err) {
      handleApiError(err, 'обновлении аккаунта')
    }
  }

  const removeAccount = async (id: string): Promise<void> => {
    try {
      await api.DELETE_ACCOUNTS(id)
      accounts.value = accounts.value.filter(account => account.id !== id)
      toast('Успешно', { description: 'Аккаунт удалён' })
    } catch (err) {
      handleApiError(err, 'удалении аккаунта')
    }
  }

  return {
    accounts,
    isLoading,
    load,
    add,
    update,
    removeAccount,
  }
})
