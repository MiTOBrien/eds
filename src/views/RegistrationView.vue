<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRoles = ref([])
// const showPassword = ref(false)
const router = useRouter()
const userStore = useUserStore()

const register = async () => {
  // Check if passwords match
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  if (selectedRoles.value.length === 0) {
    alert('Please select at least one role')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          email: email.value,
          password: password.value,
          roles: selectedRoles.value,
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      alert('Registration successful! Please login.')
      router.push('/')
    } else {
      alert(data.error || 'Registration failed')
    }
  } catch (error) {
    console.error(error)
    alert('An error occurred during registration')
  }
}
</script>

<template>
  <main>
    <h1>Early Draft Society</h1>
    <div class="registration-form">
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="email">Email address:</label>
          <input
            v-model="email"
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            required
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
          />
        </div>

        <div class="form-group">
          <label for="confirmpassword">Confirm Password:</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmpassword"
            name="confirmpassword"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div class="form-group">
          <fieldset class="roles-fieldset">
            <legend>Register as:</legend>
            <div class="roles-grid">
              <div class="role-option">
                <input type="checkbox" id="author" value="author" v-model="selectedRoles" />
                <label for="author">Author</label>
              </div>

              <div class="role-option">
                <input type="checkbox" id="arcreader" value="arcreader" v-model="selectedRoles" />
                <label for="arcreader">ARC Reader</label>
              </div>

              <div class="role-option">
                <input type="checkbox" id="betareader" value="betareader" v-model="selectedRoles" />
                <label for="betareader">Beta Reader</label>
              </div>

              <div class="role-option">
                <input
                  type="checkbox"
                  id="proofreader"
                  value="proofreader"
                  v-model="selectedRoles"
                />
                <label for="proofreader">Proof Reader</label>
              </div>
            </div>
          </fieldset>
        </div>

        <button type="submit" class="submit-btn">Register</button>
      </form>

      <p class="back-link">
        <RouterLink to="/">Back to login</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.registration-form {
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

.form-group input[type='email'],
.form-group input[type='password'] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input[type='email']:focus,
.form-group input[type='password']:focus {
  outline: none;
  border-color: #007bff;
}

.roles-fieldset {
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 0;
}

.roles-fieldset legend {
  font-weight: 600;
  color: #555;
  padding: 0 0.5rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.role-option label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
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

.back-link {
  text-align: center;
  margin-top: 1rem;
}

/* Responsive design */
@media (max-width: 480px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }

  main {
    padding: 1rem;
  }

  .registration-form {
    padding: 1.5rem;
  }
}
</style>
