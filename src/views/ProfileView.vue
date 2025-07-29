<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()
const selectedRoles = ref([])

// Initialize selectedRoles with user's existing roles
const initializeRoles = () => {
  if (userStore.roles && Array.isArray(userStore.roles)) {
    // Extract role names from role objects if they're objects, or use directly if they're strings
    selectedRoles.value = userStore.roles.map((role) =>
      typeof role === 'object' ? role.name : role,
    )
  }
}

// Computed property to check if user selected any reader roles
const isReaderRole = computed(() => {
  return selectedRoles.value.some((role) =>
    ['author', 'arcreader', 'betareader', 'proofreader'].includes(role),
  )
})

onMounted(() => {
  userStore.restoreFromLocalStorage()
  initializeRoles() // Initialize roles after restoring from localStorage
})
</script>

<template>
  <main class="profile-container">
    <NavbarView />

    <div class="content-wrapper">
      <header class="profile-header">
        <h3>User Profile</h3>
        <p class="subtitle">Manage your account information and preferences</p>
      </header>

      <form class="profile-form">
        <!-- Personal Information Section -->
        <section class="form-section">
          <fieldset class="info-fieldset">
            <legend>Personal Information</legend>

            <div class="fields-grid">
              <div class="profile-field">
                <label for="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  v-model="userStore.email"
                  disabled
                  class="input-disabled"
                />
              </div>

              <div class="profile-field">
                <label for="username">Username:</label>
                <input
                  type="text"
                  v-model="userStore.username"
                  id="username"
                  name="username"
                  placeholder="Username - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="first-name">First Name:</label>
                <input
                  type="text"
                  v-model="userStore.first_name"
                  id="first-name"
                  name="first-name"
                  placeholder="First name"
                />
              </div>

              <div class="profile-field">
                <label for="last-name">Last Name:</label>
                <input
                  type="text"
                  v-model="userStore.last_name"
                  id="last-name"
                  name="last-name"
                  placeholder="Last name"
                />
              </div>
            </div>
          </fieldset>
        </section>

        <!-- Roles Section -->
        <section class="form-section">
          <fieldset class="roles-fieldset">
            <legend>Register as:</legend>

            <div class="roles-container">
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
                  <input
                    type="checkbox"
                    id="betareader"
                    value="betareader"
                    v-model="selectedRoles"
                  />
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

              <div v-if="isReaderRole" class="professional-section">
                <div class="info-box">
                  <p>
                    <strong>Note:</strong> Non-professional ARC/Beta/Proof readers are listed for
                    free.
                  </p>
                  <p>
                    For the purposes of this website, you are a professional if you charge for your
                    services.
                  </p>
                </div>

                <div class="professional-options">
                  <h4>Are you a Professional?</h4>
                  <div class="radio-group">
                    <div class="radio-option">
                      <input
                        type="radio"
                        id="yes"
                        name="professional"
                        value="true"
                        v-model="userStore.professional"
                      />
                      <label for="yes">Yes</label>
                    </div>
                    <div class="radio-option">
                      <input
                        type="radio"
                        id="no"
                        name="professional"
                        value="false"
                        v-model="userStore.professional"
                      />
                      <label for="no">No</label>
                    </div>
                  </div>
                </div>

                <div class="acknowledgement">
                  <div class="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="acknowledgement"
                      name="acknowledgement"
                      value="agree"
                    />
                    <label for="acknowledgement">
                      I acknowledge that if I register as a non-professional and am reported for
                      requesting payment, my account will be deleted.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <!-- Social Media Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="info-fieldset">
            <legend>Social Media Links</legend>

            <div class="fields-grid">
              <div class="profile-field">
                <label for="facebook">Facebook:</label>
                <input
                  type="text"
                  v-model="userStore.facebook"
                  id="facebook"
                  name="facebook"
                  placeholder="Facebook account link - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="instagram">Instagram:</label>
                <input
                  type="text"
                  v-model="userStore.instagram"
                  id="instagram"
                  name="instagram"
                  placeholder="Instagram account link - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="x">X (Twitter):</label>
                <input
                  type="text"
                  v-model="userStore.x"
                  id="x"
                  name="x"
                  placeholder="X account link - Optional"
                />
              </div>

              <div class="profile-field bio-field">
                <label for="bio">Bio:</label>
                <textarea
                  id="bio"
                  rows="4"
                  placeholder="Tell us about yourself..."
                  v-model="userStore.bio"
                ></textarea>
              </div>
            </div>
          </fieldset>
        </section>

        <div class="button-wrapper">
          <button type="submit" class="submit-btn">Update Profile</button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  width: 100%;
}

.info-fieldset,
.roles-fieldset {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-fieldset legend,
.roles-fieldset legend {
  font-weight: 600;
  color: #555;
  padding: 0 1rem;
  font-size: 1.1rem;
}

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bio-field {
  grid-column: 1 / -1;
}

.profile-field label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.profile-field input,
.profile-field textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.profile-field input:focus,
.profile-field textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.input-disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.profile-field textarea {
  resize: vertical;
  min-height: 100px;
}

.roles-container {
  margin-top: 1rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.role-option:hover {
  background-color: #f8f9fa;
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

.professional-section {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.info-box {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0 4px 4px 0;
}

.info-box p {
  margin: 0.5rem 0;
  color: #555;
}

.professional-options h4 {
  margin-bottom: 0.75rem;
  color: #555;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option input[type='radio'] {
  width: 18px;
  height: 18px;
  accent-color: #007bff;
}

.radio-option label {
  cursor: pointer;
  font-weight: normal;
}

.acknowledgement {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 1rem;
}

.checkbox-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.checkbox-wrapper input[type='checkbox'] {
  width: 18px;
  height: 18px;
  margin-top: 0.2rem;
  flex-shrink: 0;
  accent-color: #007bff;
}

.checkbox-wrapper label {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #856404;
  cursor: pointer;
}

.button-wrapper {
  text-align: center;
  margin-top: 2rem;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 200px;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.submit-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .fields-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
    gap: 0.75rem;
  }

  .profile-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 0.5rem;
  }

  .info-fieldset,
  .roles-fieldset {
    padding: 1rem;
  }
}
</style>
