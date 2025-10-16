<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const userStore = useUserStore()

onMounted(async () => {
  const response = await fetch('/api/user', { credentials: 'include' });
  const user = await response.json();
  userStore.setUser(user);
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
