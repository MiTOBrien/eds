<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { loadStripe } from '@stripe/stripe-js'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()
const selectedPlan = ref(null)
const token = computed(() => userStore.token)

const startCheckout = async (tier) => {
  selectedPlan.value = tier
  try {
    const response = await fetch(`${API_BASE_URL}/payments/create_checkout_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({ tier }),
    })

    const data = await response.json()

    if (!response.ok || !data.url) {
      alert('Unable to start payment process. Please try again.')
      return
    }

    window.location.href = data.url
  } catch (err) {
    console.error('Stripe checkout session error:', err)
    alert('Unable to start payment process.')
  }
}
</script>

<template>
  <main>
    <div class="header-section">
      <NavbarView />
      <hr />
      <h3>Upgrade Your Account</h3>
    </div>
    <p>
      Select a subscription plan to unlock premium features if you want to charge authors for your
      services. <br /><strong>Note:</strong> If you are reported for requesting payment without a
      paid subscription plan your account will be removed.
    </p>

    <div class="plan-options">
      <div class="plan-card" :class="{ active: selectedPlan === 'monthly' }">
        <h2>Monthly Plan</h2>
        <p>$15/month</p>
        <button @click="startCheckout('monthly')">Choose Monthly</button>
      </div>

      <div class="plan-card" :class="{ active: selectedPlan === 'quarterly' }">
        <h2>Quarterly Plan</h2>
        <p>$37.50 every 3 months</p>
        <button @click="startCheckout('quarterly')">Choose Quarterly</button>
      </div>

      <div class="plan-card" :class="{ active: selectedPlan === 'annual' }">
        <h2>Annual Plan</h2>
        <p>$120/year</p>
        <button @click="startCheckout('annual')">Choose Annual</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.plan-options {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}
.plan-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  width: 200px;
  text-align: center;
}
.plan-card.active {
  border-color: #0070f3;
  background-color: #f0f8ff;
}
button {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .plan-options {
    flex-direction: column;
    align-items: center;
  }

  .plan-card {
    width: 90%;
    max-width: 300px;
    margin-bottom: 1rem;
  }
}

</style>
