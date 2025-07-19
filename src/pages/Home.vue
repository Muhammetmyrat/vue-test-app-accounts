<script setup lang="ts">
import { onMounted } from 'vue'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertCircle, Trash, Eye, EyeOff } from 'lucide-vue-next'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAccounts } from '@/composables/useAccounts'

import type { AccountType } from '@/types/accounts'

const {
  fields,
  values,
  setFieldValue,
  isPasswordVisible,
  isConfirmOpen,
  togglePasswordVisibility,
  handleBlur,
  handleAdd,
  handleRemove,
  handleConfirm,
  loadAccounts,
} = useAccounts()

onMounted(loadAccounts)
</script>

<template>
  <div class="h-full w-full flex justify-center">
    <div class="w-full max-w-5xl p-4 flex flex-col gap-4">
      <div class="flex items-center gap-2 mt-10">
        <span class="text-lg font-semibold">Учетные записи</span>
        <Button variant="outline" size="icon" @click="handleAdd">
          <Plus class="w-4 h-4" />
        </Button>
      </div>

      <Alert variant="default">
        <AlertCircle class="w-4 h-4" />
        <AlertDescription
          >Для указания нескольких меток используйте «;»</AlertDescription
        >
      </Alert>

      <div
        class="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground"
      >
        <span>Метки</span>
        <span>Тип записи</span>
        <span>Логин</span>
        <span>Пароль</span>
        <span></span>
      </div>

      <div
        v-for="(field, index) in fields"
        :key="field.key"
        class="grid grid-cols-5 gap-2 items-start"
      >
        <FormField
          :name="`accounts[${index}].labels`"
          v-slot="{ componentField }"
        >
          <FormItem>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="Метка"
                autocomplete="off"
                @input="(e: Event)=> {
                  const upper = (e.target as HTMLInputElement).value.toUpperCase()
                  setFieldValue(`accounts.${index}.labels`, upper)
                }"
                @blur="handleBlur(index)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField :name="`accounts[${index}].type`">
          <FormItem>
            <FormControl>
              <Select
                :modelValue="values.accounts?.[index]?.type"
                @update:modelValue="
                  (val) => {
                    if (val) {
                      setFieldValue(`accounts.${index}.type`, val as AccountType)
                      handleBlur(index)
                    }
                  }
                "
              >
                <SelectTrigger class="w-full"
                  ><SelectValue placeholder="Тип"
                /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Локальная</SelectItem>
                  <SelectItem value="ldap">LDAP</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          :name="`accounts[${index}].login`"
          v-slot="{ componentField }"
        >
          <FormItem>
            <FormControl>
              <Input
                v-bind="componentField"
                placeholder="Логин"
                autocomplete="off"
                @blur="handleBlur(index)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          :name="`accounts[${index}].password`"
          v-slot="{ componentField }"
        >
          <FormItem v-if="values.accounts?.[index]?.type === 'local'">
            <FormControl>
              <div class="relative w-full max-w-sm items-center">
                <Input
                  v-bind="componentField"
                  :type="isPasswordVisible[index] ? 'text' : 'password'"
                  placeholder="Пароль"
                  autocomplete="off"
                  class="pr-8"
                  @blur="handleBlur(index)"
                />
                <span
                  class="absolute end-0 inset-y-0 flex items-center px-2 cursor-pointer"
                  @click.stop="togglePasswordVisibility(index)"
                >
                  <component
                    :is="isPasswordVisible[index] ? Eye : EyeOff"
                    class="size-4 text-muted-foreground"
                  />
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button variant="outline" size="icon" @click="handleRemove(index)">
          <Trash class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>

  <ConfirmDialog
    :open="isConfirmOpen"
    description="Это действие необратимо. Аккаунт будет безвозвратно удалён."
    @confirm="handleConfirm"
    @close="() => (isConfirmOpen = false)"
  />
</template>
