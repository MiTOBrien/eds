<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const password = ref('')
// const showPassword = ref(false)
const router = useRouter()
const userStore = useUserStore()

const login = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          email: email.value,
          password: password.value,
        },
      }),
    })

    const data = await response.json()

    const token = data.status.token

    if (response.ok && token) {
      userStore.setUser({
        token: token,
        id: data.status.data.user.id,
        username: data.status.data.user.username,
        name: data.status.data.user.name,
        email: data.status.data.user.email,
      })

      localStorage.setItem('token', token)

      router.push('/home')
    } else {
      alert(data.error || 'Login failed')
    }
  } catch (error) {
    console.error(error)
    alert('An error occurred during login')
  }
}
</script>

<template>
  <main>
    <h1>Early Draft Society</h1>
    <form @submit.prevent="login">
      <label for="email">Email address:</label>
      <input type="email" id="email" name="email" placeholder="email address" required />
      <br />
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" placeholder="password" required />
      <br />
      <label for="confirmpassword">Confirm Password:</label>
      <input
        type="password"
        id="confirmpassword"
        name="confirmpassword"
        placeholder="confirm password"
        required
      />
      <br />
      <button type="submit">Register</button>
    </form>
    <p><RouterLink to="/">Back to login</RouterLink></p>
  </main>
</template>
<style scoped></style>
