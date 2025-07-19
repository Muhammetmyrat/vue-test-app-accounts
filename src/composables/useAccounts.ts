import { ref } from 'vue'
import { useForm, useFieldArray } from 'vee-validate'
import { z } from 'zod'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useAccountsStore } from '@/stores/accounts'
import type { Account } from '@/types/accounts'

const accountSchema = z
  .object({
    id: z.string().optional(),
    labels: z.string().max(50).optional(),
    type: z.enum(['local', 'ldap']),
    login: z.string().min(1, 'Обязательное поле').max(100),
    password: z.string().max(100).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'local' && (!data.password || !data.password.trim())) {
      ctx.addIssue({
        path: ['password'],
        code: z.ZodIssueCode.custom,
        message: 'Обязательное поле',
      })
    }
  })

export function useAccounts() {
  const accountStore = useAccountsStore()

  const { accounts } = storeToRefs(accountStore)

  const { load, add, update, removeAccount } = accountStore

  const { resetForm, values, setFieldValue } = useForm({
    validationSchema: toTypedSchema(
      z.object({ accounts: z.array(accountSchema) })
    ),
    initialValues: { accounts: [] },
  })
  const { fields, push, remove } = useFieldArray('accounts')

  const isPasswordVisible = ref<Record<number, boolean>>({})
  const isConfirmOpen = ref(false)
  const selectedAccountIndex = ref(0)

  const parseLabels = (labels?: string): { text: string }[] =>
    labels
      ?.split(';')
      .map((text): { text: string } => ({ text }))
      .filter(l => l.text.trim() !== '') ?? []

  const loadAccounts = async () => {
    await load()

    resetForm({
      values: {
        accounts: (accounts.value as Account[]).map(
          ({ labels = [], ...rest }) => ({
            ...rest,
            labels: labels.map((l: { text: string }) => l.text).join(';'),
          })
        ),
      },
    })
  }

  const handleBlur = async (index: number) => {
    const account = values.accounts?.[index]
    if (!account) return

    const parsed = accountSchema.safeParse(account)
    if (!parsed.success) return

    const transformed: Account = {
      ...account,
      labels: parseLabels(account.labels),
      password: account.type === 'ldap' ? null : account.password,
    }

    if (account.id) {
      await update(transformed)
    } else {
      const created = await add(transformed)
      if (created?.labels) {
        setFieldValue(`accounts.${index}`, {
          ...created,
          labels: created.labels.map(l => l.text).join(';'),
        })
      }
    }
  }

  const handleAdd = () => {
    push({ type: 'local', login: '', password: '', labels: '' })
  }

  const handleRemove = (index: number) => {
    selectedAccountIndex.value = index
    isConfirmOpen.value = true
  }

  const handleConfirm = async () => {
    const account = values.accounts?.[selectedAccountIndex.value]
    if (account?.id) await removeAccount(account.id)
    remove(selectedAccountIndex.value)
    isConfirmOpen.value = false
  }

  const togglePasswordVisibility = (index: number) => {
    isPasswordVisible.value[index] = !isPasswordVisible.value[index]
  }

  return {
    fields,
    values,
    setFieldValue,

    isPasswordVisible,
    isConfirmOpen,
    togglePasswordVisibility,

    loadAccounts,
    handleBlur,
    handleAdd,
    handleRemove,
    handleConfirm,
  }
}
