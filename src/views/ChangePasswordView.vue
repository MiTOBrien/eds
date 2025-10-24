<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

const token = computed(() => userStore.token)
const currentPassword = ref('')
const showCurrentPassword = ref(false)
const newPassword = ref('')
const showNewPassword = ref(false)
const confirmNewPassword = ref('')
const showConfirmNewPassword = ref(false)
const passwordErrors = ref([])

const validatePassword = () => {
  passwordErrors.value = []

  if (!currentPassword.value) {
    passwordErrors.value.push('Current password is required')
  }

  if (!newPassword.value) {
    passwordErrors.value.push('New password is required')
  } else if (newPassword.value.length < 8) {
    passwordErrors.value.push('New password must be at least 6 characters')
  }

  if (newPassword.value !== confirmNewPassword.value) {
    passwordErrors.value.push('Password confirmation does not match')
  }

  return passwordErrors.value.length === 0
}

const handleChangePassword = async () => {
  if (!validatePassword()) {
    return
  }
  console.log('Token:', userStore.token) // Debugging line to check the token value
  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        user: {
          current_password: currentPassword.value,
          password: newPassword.value,
          password_confirmation: confirmNewPassword.value,
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      alert('Password changed successfully!')
      // Clear the form
      currentPassword.value = ''
      newPassword.value = ''
      confirmNewPassword.value = ''
      showPasswordSection.value = false
      passwordErrors.value = []
    } else {
      passwordErrors.value = [data.error || 'Password change failed']
    }
  } catch (err) {
    console.error(err)
    passwordErrors.value = ['An error occurred while changing password']
  }
}
</script>

<template>
  <main>
    <div class="header-section">
      <NavbarView />
      <hr />
    </div>
    <div class="container mt-5">
      <h3>Change Password</h3>
      <form @submit.prevent="handleChangePassword">
        <div class="form-grid">
          <!-- Current Password -->
          <div class="form-group password-wrapper">
            <label for="currentPassword" class="form-label">Current Password</label>
            <div class="password-field">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-control"
                id="currentPassword"
                v-model="currentPassword"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                {{ showCurrentPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="form-group password-wrapper">
            <label for="newPassword" class="form-label">New Password</label>
            <div class="password-field">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                class="form-control"
                id="newPassword"
                v-model="newPassword"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div class="form-group password-wrapper">
            <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
            <div class="password-field">
              <input
                :type="showConfirmNewPassword ? 'text' : 'password'"
                class="form-control"
                id="confirmNewPassword"
                v-model="confirmNewPassword"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmNewPassword = !showConfirmNewPassword"
              >
                {{ showConfirmNewPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
        </div>
        <div class="button-wrapper">
          <button type="submit" class="btn btn-primary">Change Password</button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-control {
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
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

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 50px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}
</style>
