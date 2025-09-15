<script setup>
import { ref } from 'vue'
import NavbarView from './NavbarView.vue'

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

const handleChangePassword = () => {
  // Implement password change logic here
}
</script>

<template>
  <div class="header-section">
    <NavbarView />
    <hr />
  </div>
  <div class="container mt-5">
    <h3>Change Password</h3>
    <form @submit.prevent="handleChangePassword">
      <div class="form-grid">
        <div class="form-group">
          <label for="currentPassword" class="form-label">Current Password</label>
          <input
            type="password"
            class="form-control"
            id="currentPassword"
            v-model="currentPassword"
            required
          />
        </div>
        <div class="form-group">
          <label for="newPassword" class="form-label">New Password</label>
          <input
            type="password"
            class="form-control"
            id="newPassword"
            v-model="newPassword"
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
          <input
            type="password"
            class="form-control"
            id="confirmNewPassword"
            v-model="confirmNewPassword"
            required
          />
        </div>
      </div>
      <div class="button-wrapper">
        <button type="submit" class="btn btn-primary">Change Password</button>
      </div>
    </form>
  </div>
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
