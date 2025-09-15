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
    <h2>Change Password</h2>
    <form @submit.prevent="handleChangePassword">
      <div class="mb-3">
        <label for="currentPassword" class="form-label">Current Password</label>
        <input
          type="password"
          class="form-control"
          id="currentPassword"
          v-model="currentPassword"
          required
        />
      </div>
      <div class="mb-3">
        <label for="newPassword" class="form-label">New Password</label>
        <input
          type="password"
          class="form-control"
          id="newPassword"
          v-model="newPassword"
          required
        />
      </div>
      <div class="mb-3">
        <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
        <input
          type="password"
          class="form-control"
          id="confirmNewPassword"
          v-model="confirmNewPassword"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Change Password</button>
    </form>
  </div>
</template>

<style scoped></style>
