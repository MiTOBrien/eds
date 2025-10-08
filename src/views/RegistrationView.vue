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
const confirmPassword = ref('')
const isPasswordValid = computed(() => isValidPassword(password.value))
const doPasswordsMatch = computed(() => password.value === confirmPassword.value)
const selectedRoles = ref([])
const chargesForServices = ref(false)
const subscriptionPlan = ref('monthly') // 'monthly' 'quarterly' or 'annual'
const freePlanAcknowledgment = ref(false)
const router = useRouter()
const userStore = useUserStore()

// Computed property to determine if user needs paid subscription
const needsPaidSubscription = computed(() => {
  const paidRoleIds = [3, 4, 5]
  const hasPaidRole = selectedRoles.value.some((id) => paidRoleIds.includes(id))
  return hasPaidRole && chargesForServices.value === true
})

// Computed property to determine subscription type
const subscriptionType = computed(() => {
  if (!needsPaidSubscription.value) return 'free'
  switch (subscriptionPlan.value) {
    case 'quarterly':
      return 'paid_quarterly'
    case 'annual':
      return 'paid_annual'
    default:
      return 'paid_monthly'
  }
})

// Computed property for subscription price display
const subscriptionPrice = computed(() => {
  if (!needsPaidSubscription.value) return 'Free'
  switch (subscriptionPlan.value) {
    case 'quarterly':
      return '$12.50/month (billed quarterly)'
    case 'annual':
      return '$10.00/month (billed annually)'
    default:
      return '$15.00/month'
  }
})

const register = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  if (selectedRoles.value.length === 0) {
    alert('Please select at least one role')
    return
  }

  if (!needsPaidSubscription.value && !freePlanAcknowledgment.value) {
    alert('Please acknowledge the free plan terms')
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
          role_ids: selectedRoles.value,
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

        <div class="form-group">
          <p v-if="!isPasswordValid" class="validation-message">
            Password must be at least 8 characters and include uppercase, lowercase, and a number or
            symbol.
          </p>
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
          <p v-if="!doPasswordsMatch" class="validation-message">Passwords do not match.</p>
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

        <!-- Service Pricing Question -->
        <div
          class="form-group"
          v-if="
            needsPaidSubscription || selectedRoles.some((role) => [3, 4, 5].includes(Number(role)))
          "
        >
          <fieldset class="service-pricing-fieldset">
            <legend>Do you charge authors for your services?</legend>
            <div class="pricing-options">
              <div class="pricing-option">
                <input
                  type="radio"
                  id="free-services"
                  :value="false"
                  v-model="chargesForServices"
                  @change="chargesForServices = false"
                />
                <label for="free-services">No, I provide free services</label>
              </div>
              <div class="pricing-option">
                <input
                  type="radio"
                  id="paid-services"
                  :value="true"
                  v-model="chargesForServices"
                  @change="chargesForServices = true"
                />
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

              <!-- Free Plan Acknowledgment -->
              <div class="acknowledgment-wrapper">
                <div class="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="free-plan-acknowledgment"
                    v-model="freePlanAcknowledgment"
                    required
                  />
                  <label for="free-plan-acknowledgment">
                    I acknowledge that if I register as a non-professional and am reported for
                    requesting payment, my account will be deleted.
                  </label>
                </div>
              </div>
            </div>

            <!-- Paid Account Options -->
            <div v-else class="subscription-options">
              <p class="subscription-note">
                Since you charge for your services, a paid subscription is required to access our
                platform.
              </p>

              <div class="plan-options">
                <div class="plan-option" :class="{ active: subscriptionPlan === 'monthly' }">
                  <input
                    type="radio"
                    id="monthly-plan"
                    value="monthly"
                    v-model="subscriptionPlan"
                  />
                  <label for="monthly-plan" class="plan-label">
                    <div class="plan-details">
                      <h3>Monthly Plan</h3>
                      <p class="price">$15/month</p>
                      <p class="plan-description">Flexible monthly billing</p>
                    </div>
                  </label>
                </div>

                <div class="plan-option" :class="{ active: subscriptionPlan === 'quarterly' }">
                  <input
                    type="radio"
                    id="quarterly-plan"
                    value="quarterly"
                    v-model="subscriptionPlan"
                  />
                  <label for="quarterly-plan" class="plan-label">
                    <div class="plan-details">
                      <h3>Quarterly Plan</h3>
                      <p class="price">$12.50/month</p>
                      <p class="plan-description">Billed every 3 months ($37.50)</p>
                    </div>
                  </label>
                </div>

                <div class="plan-option" :class="{ active: subscriptionPlan === 'annual' }">
                  <input type="radio" id="annual-plan" value="annual" v-model="subscriptionPlan" />
                  <label for="annual-plan" class="plan-label">
                    <div class="plan-details">
                      <h3>Annual Plan</h3>
                      <p class="price">$120/year</p>
                      <p class="plan-description">Save with annual billing</p>
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
