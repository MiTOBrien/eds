<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRoles = ref([])
const chargesForServices = ref(false)
const subscriptionPlan = ref('monthly') // 'monthly' or 'annual'
const router = useRouter()
const userStore = useUserStore()

// Computed property to determine if user needs paid subscription
const needsPaidSubscription = computed(() => {
  const paidRoles = ['arcreader', 'betareader', 'proofreader']
  const hasPaidRole = selectedRoles.value.some(role => paidRoles.includes(role))
  return hasPaidRole && chargesForServices.value
})

// Computed property to determine subscription type
const subscriptionType = computed(() => {
  if (needsPaidSubscription.value) {
    return subscriptionPlan.value === 'annual' ? 'paid_annual' : 'paid_monthly'
  }
  return 'free'
})

// Computed property for subscription price display
const subscriptionPrice = computed(() => {
  if (!needsPaidSubscription.value) return 'Free'
  return subscriptionPlan.value === 'annual' ? '$100/year' : '$10/month'
})

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
          subscription_type: subscriptionType.value,
          charges_for_services: chargesForServices.value,
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

        <!-- Service Pricing Question -->
        <div class="form-group" v-if="selectedRoles.some(role => ['arcreader', 'betareader', 'proofreader'].includes(role))">
          <fieldset class="service-pricing-fieldset">
            <legend>Do you charge authors for your services?</legend>
            <div class="pricing-options">
              <div class="pricing-option">
                <input type="radio" id="free-services" :value="false" v-model="chargesForServices" />
                <label for="free-services">No, I provide free services</label>
              </div>
              <div class="pricing-option">
                <input type="radio" id="paid-services" :value="true" v-model="chargesForServices" />
                <label for="paid-services">Yes, I charge a fee for my services</label>
              </div>
            </div>
          </fieldset>
        </div>

        <!-- Subscription Section -->
        <div class="form-group">
          <fieldset class="subscription-fieldset">
            <legend>Subscription Plan:</legend>
            
            <!-- Free Account Display -->
            <div v-if="!needsPaidSubscription" class="subscription-info free-plan">
              <div class="plan-details">
                <h3>Free Account</h3>
                <p class="price">$0/month</p>
                <p class="plan-description">
                  For authors and readers who provide free services to the community.
                </p>
              </div>
            </div>

            <!-- Paid Account Options -->
            <div v-else class="subscription-options">
              <p class="subscription-note">
                Since you charge for your services, a paid subscription is required to access our platform.
              </p>
              
              <div class="plan-options">
                <div class="plan-option" :class="{ active: subscriptionPlan === 'monthly' }">
                  <input type="radio" id="monthly-plan" value="monthly" v-model="subscriptionPlan" />
                  <label for="monthly-plan" class="plan-label">
                    <div class="plan-details">
                      <h3>Monthly Plan</h3>
                      <p class="price">$10/month</p>
                      <p class="plan-description">Flexible monthly billing</p>
                    </div>
                  </label>
                </div>

                <div class="plan-option" :class="{ active: subscriptionPlan === 'annual' }">
                  <input type="radio" id="annual-plan" value="annual" v-model="subscriptionPlan" />
                  <label for="annual-plan" class="plan-label">
                    <div class="plan-details">
                      <h3>Annual Plan</h3>
                      <p class="price">$100/year</p>
                      <p class="plan-description">Save $20 with annual billing</p>
                      <span class="savings-badge">Best Value</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Current Selection Summary -->
            <div class="subscription-summary">
              <p><strong>Selected Plan:</strong> {{ subscriptionPrice }}</p>
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

/* Service Pricing Styles */
.pricing-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.pricing-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-option input[type='radio'] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.pricing-option label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

/* Subscription Styles */
.subscription-info.free-plan {
  background: #e8f5e8;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.subscription-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2e7d32;
}

.subscription-info .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e7d32;
  margin: 0.5rem 0;
}

.subscription-info .plan-description {
  margin: 0.5rem 0 0 0;
  color: #555;
}

.subscription-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #856404;
}

.plan-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.plan-option {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0;
  transition: all 0.3s ease;
}

.plan-option:hover {
  border-color: #007bff;
}

.plan-option.active {
  border-color: #007bff;
  background: #f0f8ff;
}

.plan-option input[type='radio'] {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.plan-label {
  display: block;
  padding: 1rem;
  cursor: pointer;
  margin: 0;
  font-weight: normal;
}

.plan-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.plan-details .price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
  margin: 0.25rem 0;
}

.plan-details .plan-description {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.savings-badge {
  display: inline-block;
  background: #28a745;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.5rem;
  font-weight: 600;
}

.subscription-summary {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.75rem;
  text-align: center;
}

.subscription-summary p {
  margin: 0;
  color: #495057;
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