<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { PASSWORD_REGEX, isValidPassword } from '@/utils/passwordRules'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const username = ref('')
const first_name = ref('')
const last_name = ref('')
const password = ref('')
const showPassword = ref(false)
const confirmPassword = ref('')
const showConfirmPassword = ref(false)
const selectedRoles = ref([])
const acceptedTOS = ref(false)

const isPasswordValid = computed(() => isValidPassword(password.value))
const doPasswordsMatch = computed(() => password.value === confirmPassword.value)

const router = useRouter()
const userStore = useUserStore()

const register = async () => {
  if (!isPasswordValid.value) {
    alert('Password does not meet complexity requirements')
    return
  }

  if (!doPasswordsMatch.value) {
    alert('Passwords do not match')
    return
  }

  if (selectedRoles.value.length === 0) {
    alert('Please select at least one role')
    return
  }

  if (!acceptedTOS.value) {
    alert('You must acknowledge the Terms of Service to register.')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          email: email.value,
          username: username.value,
          first_name: first_name.value,
          last_name: last_name.value,
          password: password.value,
          confirm_password: confirmPassword.value,
          role_ids: selectedRoles.value,
          tos_accepted: acceptedTOS.value,
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
    <h2>Building Better Books Together</h2>
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
          <label for="username">Username:</label>
          <input
            v-model="username"
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="form-group">
          <label for="first_name">First Name:</label>
          <input
            v-model="first_name"
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div class="form-group">
          <label for="last_name">Last Name:</label>
          <input
            v-model="last_name"
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Enter your last name"
            required
          />
        </div>

        <!-- Password Field -->
        <div class="form-group password-wrapper">
          <p v-if="!isPasswordValid" class="validation-message">
            Password must be at least 8 characters and include uppercase, lowercase, and a number or
            symbol.
          </p>
          <label for="password">Password:</label>
          <div class="password-field">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group password-wrapper">
          <p v-if="!doPasswordsMatch" class="validation-message">Passwords do not match.</p>
          <label for="confirmpassword">Confirm Password:</label>
          <div class="password-field">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmpassword"
              name="confirmpassword"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <fieldset class="roles-fieldset">
            <legend>Register as:</legend>
            <div class="roles-grid">
              <div class="role-option">
                <input type="checkbox" id="author" :value="2" v-model="selectedRoles" />
                <label for="author">Author</label>
              </div>

              <div class="role-option">
                <input type="checkbox" id="arcreader" :value="3" v-model="selectedRoles" />
                <label for="arcreader">ARC Reader</label>
              </div>

              <div class="role-option">
                <input type="checkbox" id="betareader" :value="4" v-model="selectedRoles" />
                <label for="betareader">Beta Reader</label>
              </div>

              <div class="role-option">
                <input type="checkbox" id="proofreader" :value="5" v-model="selectedRoles" />
                <label for="proofreader">Proof Reader</label>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="acceptedTOS" />
            I acknowledge and agree to the
            <router-link to="/terms-of-service" target="_blank">Terms of Service</router-link>.
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isPasswordValid || !doPasswordsMatch">
          Register
        </button>
      </form>

      <p class="back-link">
        <RouterLink to="/">Back to login</RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 600px;
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
.form-group input[type='password'],
.form-group input[type='text'] {
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

.roles-fieldset,
.service-pricing-fieldset,
.subscription-fieldset {
  border: 2px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin: 0;
}

.roles-fieldset legend,
.service-pricing-fieldset legend,
.subscription-fieldset legend {
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

.password-field {
  display: flex;
  align-items: center;
  position: relative;
}

.password-field input {
  flex: 1;
  padding-right: 4rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
}


/* Free Plan Acknowledgment Styles */
.acknowledgment-wrapper {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #c8e6c9;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.checkbox-wrapper input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #4caf50;
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-wrapper label {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2e7d32;
  font-weight: 500;
  cursor: pointer;
  margin: 0;
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

.submit-btn:hover {
  background-color: #0056b3;
}

.back-link {
  text-align: center;
  margin-top: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .plan-options {
    grid-template-columns: 1fr;
  }
}

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
