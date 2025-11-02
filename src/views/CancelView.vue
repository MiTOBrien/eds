<script setup>
import NavbarView from './NavbarView.vue'
</script>

<template>
  <main>
    <NavbarView />
    <div class="cancel-container">
      <h2>❌ Payment Canceled</h2>
      <p>Your subscription is canceled.</p>
      <p>If you changed your mind or had trouble completing payment, you can try again below.</p>
      <router-link to="/subscriptions">
        <button>Return to Subscription Options</button>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.cancel-container {
  text-align: center;
  margin-top: 4rem;
}
h2 {
  color: #e74c3c;
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
