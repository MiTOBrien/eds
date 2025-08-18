<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()
const selectedRoles = ref([])
const updateStatus = ref('') // Optional: for feedback messages

const token = computed(() => userStore.token)

// Initialize selectedRoles with user's existing roles
const initializeRoles = () => {
  if (userStore.roles && Array.isArray(userStore.roles)) {
    selectedRoles.value = userStore.roles.map((roleObj) =>
      typeof roleObj === 'object' ? roleObj.role.toLowerCase() : roleObj.toLowerCase(),
    )
  }
}

// Computed property to check if user selected any reader roles
const isReaderRole = computed(() => {
  return selectedRoles.value.some((role) =>
    ['arc reader', 'beta reader', 'proof reader'].includes(role),
  )
})

// Submit handler
const handleSubmit = async (event) => {
  event.preventDefault()

  try {
    const token = localStorage.getItem('jwt') // Adjust if stored differently
    console.log('JWT:', token)
    const response = await fetch(`${API_BASE_URL}/users/${userStore.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: {
          username: userStore.username,
          first_name: userStore.first_name,
          last_name: userStore.last_name,
          roles: selectedRoles.value,
          facebook: userStore.facebook,
          instagram: userStore.instagram,
          x: userStore.x,
          bio: userStore.bio,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    userStore.setUser(updatedUser) // Assuming you have a method to update store
    updateStatus.value = 'Profile updated successfully!'
  } catch (error) {
    console.error(error)
    updateStatus.value = 'Error updating profile. Please try again.'
  }
}

onMounted(() => {
  userStore.restoreFromLocalStorage()
  initializeRoles()
})
</script>

<template>
  <main class="profile-container">
    <NavbarView />
    <hr />
    <p v-if="updateStatus" class="update-message">{{ updateStatus }}</p>

    <div class="content-wrapper">
      <header class="profile-header">
        <h3>User Profile</h3>
        <p class="subtitle">Manage your account information and preferences</p>
        <p v-if="token">Token: {{ token }}</p>
        <p v-else>No token found</p>
      </header>

      <form class="profile-form" @submit="handleSubmit">
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
            <legend>Update Roles:</legend>

            <div class="roles-container">
              <div class="roles-grid">
                <div class="role-option">
                  <input type="checkbox" id="author" value="author" v-model="selectedRoles" />
                  <label for="author">Author</label>
                </div>

                <div class="role-option">
                  <input
                    type="checkbox"
                    id="arcreader"
                    value="arc reader"
                    v-model="selectedRoles"
                  />
                  <label for="arcreader">ARC Reader</label>
                </div>

                <div class="role-option">
                  <input
                    type="checkbox"
                    id="betareader"
                    value="beta reader"
                    v-model="selectedRoles"
                  />
                  <label for="betareader">Beta Reader</label>
                </div>

                <div class="role-option">
                  <input
                    type="checkbox"
                    id="proofreader"
                    value="proof reader"
                    v-model="selectedRoles"
                  />
                  <label for="proofreader">Proof Reader</label>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <!-- Genres Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="genres-fieldset">
            <legend>Preferred Genres:</legend>

            <div class="fields-container">
              <div class="fields-grid">
                <div class="profile-field">
                  <label for="genres">Select your preferred genres:</label>
                  <select id="genres" v-model="userStore.genres" multiple class="genres-select">
                    <option value="fantasy">Biographies & Memoirs</option>
                    <option value="science fiction">Business & Money</option>
                    <option value="mystery">Children's Books</option>
                    <option value="romance">History</option>
                    <option value="horror">Teen & Young Adult</option>
                    <option value="romance">Self-Help</option>
                    <option value="romance">Romance</option>
                    <option value="romance">Mystery, Thriller, & Suspense</option>
                    <option value="romance">Science Fiction & Fantasy</option>
                  </select>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <!-- Social Media Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="info-fieldset">
            <legend>Social Media Links:</legend>

            <div class="fields-grid">
              <div class="profile-field">
                <label for="facebook">https://www.facebook.com/</label>
                <input
                  type="text"
                  v-model="userStore.facebook"
                  id="facebook"
                  name="facebook"
                  placeholder="Facebook ID - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="instagram">https://www.instagram.com/</label>
                <input
                  type="text"
                  v-model="userStore.instagram"
                  id="instagram"
                  name="instagram"
                  placeholder="Instagram ID - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="x">https://www.x.com/</label>
                <input
                  type="text"
                  v-model="userStore.x"
                  id="x"
                  name="x"
                  placeholder="X ID - Optional"
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

<style scoped></style>
