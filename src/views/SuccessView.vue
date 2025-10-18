<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const user = await response.json();
    userStore.setUser(user);
  } catch (err) {
    console.error('Failed to refresh user after subscription:', err);
  }
});
</script>

<template>
  <main>
    <NavbarView />
    <div class="success-container">
      <h2>🎉 Payment Successful!</h2>
      <p>Your subscription has been activated. You now have access to premium features.</p>
      <p>You can now charge authors for your services and set up your payment methods and rates.</p>
      <router-link to="/profile">
        <button>Go to your profile page</button>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.success-container {
  text-align: center;
  margin-top: 4rem;
}
h2 {
  color: #2ecc71;
  font-size: 2rem;
}
p {
  margin: 1rem 0;
}
button {
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
button:hover {
  background-color: #005bb5;
}
</style>
