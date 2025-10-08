<script setup>
const token = route.query.reset_password_token

const payload = {
  user: {
    reset_password_token: token,
    password: password,
    password_confirmation: passwordConfirmation
  }
}

fetch('/password', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(response => {
  if (!response.ok) {
    throw new Error('Password reset failed')
  }
  return response.json()
})
.then(data => {
  console.log('Password reset successful:', data)
  // Redirect or show success message
})
.catch(error => {
  console.error('Error resetting password:', error)
  // Show error message to user
})
</script>

<template>
<form @submit.prevent="submitReset">
  <input type="password" v-model="password" placeholder="New password" />
  <input type="password" v-model="passwordConfirmation" placeholder="Confirm password" />
  <button type="submit">Reset Password</button>
</form>
</template>