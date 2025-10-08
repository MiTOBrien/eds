<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const isLoading = ref(false)
const router = useRouter()

const requestPasswordReset = async () => {
  isLoading.value = true
  console.log('Requesting password reset for:', email.value)
  try {
    const response = await fetch(`${API_BASE_URL}/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: email.value,
        },
      }),
    })

    const result = await response.json()

    if (response.ok) {
      alert('Reset instructions sent to your email.')
      router.push('/')
    } else {
      const errorMessage = result.error || 'Reset failed. Please try again.'
      alert(errorMessage)
    }
  } catch (error) {
    console.error('Reset error:', error)
    alert('Something went wrong. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Early Draft Society</h1>
    <h2>Building Better Books Together</h2>
    <div class="reset-password-form">
      <form @submit.prevent="requestPasswordReset">
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

        <button type="submit" class="submit-btn">Reset Password</button>
      </form>

      <p class="forgot-password-link">
        <RouterLink to="/">Back to login page</RouterLink>
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

.reset-password-form {
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

  .reset-password-form {
    padding: 1.5rem;
  }
}
</style>
