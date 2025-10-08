<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const password = ref('')
const passwordConfirmation = ref('')
const token = route.query.reset_password_token

const submitReset = async () => {
  const payload = {
    user: {
      reset_password_token: token,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Reset failed')

    const data = await response.json()
    console.log('Success:', data)
    router.push('/login') // or show a success message
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
      <input type="password" v-model="password" placeholder="New password" />
      <input type="password" v-model="passwordConfirmation" placeholder="Confirm password" />
      <button type="submit">Reset Password</button>
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