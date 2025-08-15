<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()
const userStore = useUserStore()

const login = async () => {
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: email.value,
          password: password.value,
        },
      }),
    })

    const result = await response.json()

    const token = result.status?.token
    const user = result.status?.data?.user

    if (response.ok && token && user) {
      // Combine token with user data
      const fullUser = {
        ...user,
        token,
      }

      // Store in Pinia and localStorage
      userStore.setUser(fullUser)

      // Redirect to /home
      router.push('/home')
    } else {
      const errorMessage =
        result.error || result.status?.message || 'Login failed. Please try again.'
      alert(errorMessage)
    }
  } catch (error) {
    console.error('Login error:', error)

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert(
        `Cannot connect to backend at ${API_BASE_URL}. Please check if your backend server is running.`,
      )
    } else {
      alert(`An error occurred during login: ${error.message}`)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Early Draft Society</h1>
    <h2>Building Better Books Together</h2>
    <div class="login-form">
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email address:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="register-link">
        Don't have an account? <RouterLink to="/register">Create one here</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-form {
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

/* Responsive design */
@media (max-width: 480px) {
  main {
    padding: 1rem;
    max-width: 100%;
  }

  .login-form {
    padding: 1.5rem;
  }
}
</style>
