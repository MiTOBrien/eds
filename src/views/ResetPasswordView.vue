<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PASSWORD_REGEX, isValidPassword } from '@/utils/passwordRules'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const password = ref('')
const passwordConfirmation = ref('')
const isPasswordValid = computed(() => isValidPassword(password.value))
const doPasswordsMatch = computed(() => password.value === passwordConfirmation.value)

const token = route.query.reset_password_token

const submitReset = async () => {
  const payload = {
    user: {
      reset_password_token: token,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Reset failed')

    const data = await response.json()
    console.log('Success:', data)
    router.push('/') // or show a success message
  } catch (err) {
    console.error('Error:', err)
    // Show error to user
  }
}
</script>

<template>
  <div class="reset-password">
    <h1>Early Draft Society</h1>
    <h2>Building Better Books Together</h2>
    <hr />
    <h3>Reset Password</h3>
    <form @submit.prevent="submitReset">
      <p v-if="!isPasswordValid" class="validation-message">
        Password must be at least 8 characters and include uppercase, lowercase, and a number or
        symbol.
      </p>
      <input type="password" v-model="password" placeholder="New password" />
      <p v-if="!doPasswordsMatch" class="validation-message">Passwords do not match.</p>
      <input type="password" v-model="passwordConfirmation" placeholder="Confirm password" />
      <button type="submit" :disabled="!isPasswordValid || !doPasswordsMatch">Reset Password</button>
    </form>
  </div>
</template>

<style scoped>
.reset-password {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  background: #fffbe6;
  border: 1px solid #ccc;
  border-radius: 8px;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
