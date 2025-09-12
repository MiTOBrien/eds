<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

const availableGenres = ref([]) // All genres from backend
const selectedGenres = ref([]) // Genre IDs selected by user
const selectedSubGenres = reactive({}) // Subgenre IDs grouped by genre
const selectedRoles = ref([])
const updateStatus = ref('')
const pricingModel = ref('free') // 'free' or 'paid'
const pricingTiers = ref([{ wordCount: 10000, price: 30 }])
const chargesForServices = computed(() => pricingModel.value === 'paid')

const token = computed(() => userStore.token)

const READER_ROLE_IDS = [3, 4, 5]

const isReaderRole = computed(() =>
  selectedRoles.value.some((roleId) => READER_ROLE_IDS.includes(Number(roleId))),
)

// Initialize roles from store
const initializeRoles = () => {
  if (Array.isArray(userStore.roles)) {
    selectedRoles.value = userStore.roles.map((roleObj) =>
      typeof roleObj === 'object' ? roleObj.id : roleObj,
    )
  }
}

// Initialize genre and subgenre selections from store
const initializeGenreSelections = () => {
  if (Array.isArray(userStore.userGenres)) {
    selectedGenres.value = userStore.userGenres.map((genre) => genre.id)

    userStore.userGenres.forEach((genre) => {
      if (Array.isArray(genre.subgenres) && genre.subgenres.length > 0) {
        selectedSubGenres[genre.id] = genre.subgenres.map((sub) => sub.id)
      }
    })
  }
}

// Fetch all genres from backend
const fetchGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/genres`, {
      headers: {
        Authorization: `Bearer ${userStore.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    availableGenres.value = data
  } catch (error) {
    console.error('Error fetching genres:', error)
  }
}

// Toggle subgenre visibility
const toggleSubGenres = (genreId) => {
  if (!selectedSubGenres[genreId]) {
    selectedSubGenres[genreId] = []
  }
}

const addTier = () => {
  pricingTiers.value.push({ wordCount: null, price: null })
}

const removeTier = (index) => {
  pricingTiers.value.splice(index, 1)
}

// Submit profile update
const handleSubmit = async (event) => {
  event.preventDefault()

  try {
    const allGenreSelections = Array.from(
      new Set([...selectedGenres.value, ...Object.values(selectedSubGenres).flat()]),
    )

    const response = await fetch(`${API_BASE_URL}/users/${userStore.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        user: {
          username: userStore.username,
          first_name: userStore.first_name,
          last_name: userStore.last_name,
          role_ids: selectedRoles.value,
          charges_for_services: chargesForServices.value,
          pricing_tiers_attributes: chargesForServices.value
            ? pricingTiers.value.map((tier) => ({
                word_count: tier.wordCount,
                price_cents: tier.price * 100, // convert dollars to cents
                currency: 'USD',
              }))
            : [],
          facebook: userStore.facebook_handle,
          instagram: userStore.instagram_handle,
          x: userStore.x_handle,
          bio: userStore.bio,
          genre_ids: allGenreSelections,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    userStore.setUser(updatedUser)
    updateStatus.value = 'Profile updated successfully!'

    // Scroll to top after success
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error(error)
    updateStatus.value = 'Error updating profile. Please try again.'

    // Scroll to top after error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Lifecycle
onMounted(async () => {
  userStore.restoreFromLocalStorage()
  initializeRoles()
  await fetchGenres()
  initializeGenreSelections()
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
                  <input type="checkbox" id="author" value="2" v-model="selectedRoles" />
                  <label for="author">Author</label>
                </div>

                <div class="role-option">
                  <input type="checkbox" id="arcreader" value="3" v-model="selectedRoles" />
                  <label for="arcreader">ARC Reader</label>
                </div>

                <div class="role-option">
                  <input type="checkbox" id="betareader" value="4" v-model="selectedRoles" />
                  <label for="betareader">Beta Reader</label>
                </div>

                <div class="role-option">
                  <input type="checkbox" id="proofreader" value="5" v-model="selectedRoles" />
                  <label for="proofreader">Proof Reader</label>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        <!-- Pricing Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="pricing-fieldset">
            <legend>Service Pricing:</legend>

            <!-- Free or Paid Toggle -->
            <div class="pricing-toggle">
              <label>
                <input type="radio" value="free" v-model="pricingModel" />
                I offer my services for free
              </label>
              <label>
                <input type="radio" value="paid" v-model="pricingModel" />
                I charge based on word count
              </label>
            </div>

            <!-- Pricing Tiers -->
            <div v-if="pricingModel === 'paid'" class="pricing-tiers">
              <div v-for="(tier, index) in pricingTiers" :key="index" class="pricing-tier">
                <input
                  type="number"
                  v-model.number="tier.wordCount"
                  placeholder="Word count (e.g. 10000)"
                />
                <input
                  type="number"
                  v-model.number="tier.price"
                  placeholder="Price in dollars (e.g. 30)"
                />
                <button type="button" @click="removeTier(index)">Remove</button>
              </div>
              <button type="button" @click="addTier">Add Tier</button>
            </div>
          </fieldset>
        </section>

        <!-- Genres Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="genres-fieldset">
            <legend>Preferred Genres:</legend>

            <div class="genre-group">
              <div v-for="genre in availableGenres" :key="genre.id" class="genre-block">
                <!-- Genre Header -->
                <div class="genre-header">
                  <label>
                    <input
                      type="checkbox"
                      :value="genre.id"
                      v-model="selectedGenres"
                      @change="toggleSubGenres(genre.id)"
                    />
                    {{ genre.name }}
                  </label>
                </div>

                <!-- Subgenres Inline -->
                <div
                  v-if="genre.subgenres && selectedGenres.includes(genre.id)"
                  class="subgenre-inline"
                >
                  <label v-for="sub in genre.subgenres" :key="sub.id" class="subgenre-item">
                    <input type="checkbox" :value="sub.id" v-model="selectedSubGenres[genre.id]" />
                    {{ sub.name }}
                  </label>
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
                  v-model="userStore.facebook_handle"
                  id="facebook"
                  name="facebook"
                  placeholder="Facebook ID - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="instagram">https://www.instagram.com/</label>
                <input
                  type="text"
                  v-model="userStore.instagram_handle"
                  id="instagram"
                  name="instagram"
                  placeholder="Instagram ID - Optional"
                />
              </div>

              <div class="profile-field">
                <label for="x">https://www.x.com/</label>
                <input
                  type="text"
                  v-model="userStore.x_handle"
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
