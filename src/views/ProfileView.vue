<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

const selectedProfileImage = ref(null)
const availableGenres = ref([])
const selectedGenres = ref([])
const selectedSubGenres = reactive({})
const selectedRoles = ref([])
const updateStatus = ref('')

const chargesForServices = ref(false)

const token = computed(() => userStore.token)

const READER_ROLE_IDS = [3, 4, 5]
const isReaderRole = computed(() =>
  selectedRoles.value.some((roleId) => READER_ROLE_IDS.includes(Number(roleId))),
)

const initializeRoles = () => {
  if (Array.isArray(userStore.roles)) {
    selectedRoles.value = userStore.roles.map((roleObj) =>
      typeof roleObj === 'object' ? roleObj.id : roleObj,
    )
  }
}

const pricingTiers = computed(() => userStore.pricing_tiers || [])

const previewUrl = computed(() =>
  selectedProfileImage.value ? URL.createObjectURL(selectedProfileImage.value) : userStore.profile_picture
)

const handleFileChange = (e) => {
  const file = e.target?.files?.[0]
  console.log('File from input event:', file)
  if (file) {
    selectedProfileImage.value = file
    console.log('File selected:', file)
    console.log('Current selectedProfileImage:', selectedProfileImage.value)
  }
}

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

const handleSubmit = async (event) => {
  event.preventDefault()

  try {
    const allGenreSelections = Array.from(
      new Set([...selectedGenres.value, ...Object.values(selectedSubGenres).flat()]),
    )

    let uploadedImageUrl = null

    if (selectedProfileImage.value) {
      const formData = new FormData()
      formData.append('image', selectedProfileImage.value)

      const imageResponse = await fetch(`${API_BASE_URL}/users/profile-image`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${userStore.token}`,
        },
      })

      if (!imageResponse.ok) {
        throw new Error('Image upload failed')
      }

      const imageData = await imageResponse.json()
      uploadedImageUrl = imageData.image_url
    }

    const response = await fetch(`${API_BASE_URL}/users/${userStore.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        user: {
          profile_picture: uploadedImageUrl || userStore.profile_picture,
          username: userStore.username,
          first_name: userStore.first_name,
          last_name: userStore.last_name,
          hide_name: userStore.hide_name,
          role_ids: selectedRoles.value,
          charges_for_services: chargesForServices.value,
          turnaround_time: userStore.turnaround_time,
          pricing_tiers_attributes: chargesForServices.value
            ? pricingTiers.value.map((tier) => ({
                id: tier.id,
                word_count: tier.wordCount,
                price_cents: Math.round(tier.price * 100),
                currency: 'USD',
              }))
            : [],
          facebook: userStore.facebook_handle,
          instagram: userStore.instagram_handle,
          x: userStore.x_handle,
          bio: userStore.bio,
          genre_ids: allGenreSelections,
          payment_options: userStore.payment_options || [],
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedUser = await response.json()
    userStore.setUser(updatedUser)
    updateStatus.value = 'Profile updated successfully!'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error(error)
    updateStatus.value = 'Error updating profile. Please try again.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(
  () => userStore.charges_for_services,
  (isPaid) => {
    if (typeof isPaid === 'boolean') {
      chargesForServices.value = isPaid
    }
  },
  { immediate: true },
)

onMounted(async () => {
  userStore.restoreFromLocalStorage()

  if (!Array.isArray(userStore.payment_options)) {
    userStore.payment_options = []
  }

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
              <div class="profile-avatar">
                <img
                  :src="userStore.profile_picture || 'public/icons8-user-default-64.png'"
                  alt="User Avatar"
                  class="avatar-image"
                />
                <input type="file" accept="image/*" @change="handleFileChange" />
              </div>

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

              <div class="profile-field checkbox-field">
                <label for="hide-name">Hide real name on reader page:</label>
                <input
                  type="checkbox"
                  v-model="userStore.hide_name"
                  id="hide-name"
                  name="hide-name"
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

        <section v-if="isReaderRole" class="form-section">
          <fieldset class="turnaround-fieldset">
            <legend>Estimated Turnaround Time:</legend>
            <div class="form-group">
              <label for="turnaround-time">Timeframe:</label>
              <select id="turnaround-time" v-model="userStore.turnaround_time">
                <option :value="0">Not specified</option>
                <option :value="1">Less than 1 week</option>
                <option :value="2">1-2 weeks</option>
                <option :value="3">2-3 weeks</option>
                <option :value="4">3+ weeks</option>
              </select>
            </div>
          </fieldset>
        </section>

        <!-- Pricing Section - Only show if user selected reader roles -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="pricing-fieldset">
            <legend>Service Pricing:</legend>

            <!-- Checkbox Toggle -->
            <div class="pricing-toggle">
              <label>
                <input type="checkbox" v-model="chargesForServices" />
                I charge for my services
              </label>
            </div>

            <!-- Pricing Tiers -->
            <div v-if="chargesForServices" class="pricing-tiers">
              <div
                v-for="(tier, index) in pricingTiers"
                :key="tier.id || index"
                class="pricing-tier"
              >
                <div class="tier-row">
                  <div class="tier-field">
                    <label>Word Count</label>
                    <input type="number" v-model.number="tier.wordCount" placeholder="e.g. 10000" />
                  </div>

                  <div class="tier-field">
                    <label>Price (USD)</label>
                    <input type="number" v-model.number="tier.price" placeholder="e.g. 30" />
                  </div>

                  <button type="button" class="remove-btn" @click="removeTier(index)">
                    Remove
                  </button>
                </div>
              </div>

              <button type="button" class="add-btn" @click="addTier">Add Tier</button>
            </div>
          </fieldset>
        </section>

        <!-- Payment Options Section -->
        <section v-if="isReaderRole" class="form-section">
          <fieldset class="payment-fieldset">
            <legend>Payment Options:</legend>
            <div class="form-group">
              <label>Preferred Payment Methods:</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" value="paypal" v-model="userStore.payment_options" />
                  PayPal
                </label>
                <label>
                  <input type="checkbox" value="venmo" v-model="userStore.payment_options" />
                  Venmo
                </label>
                <label>
                  <input type="checkbox" value="zelle" v-model="userStore.payment_options" />
                  Zelle
                </label>
                <label>
                  <input type="checkbox" value="cashapp" v-model="userStore.payment_options" />
                  Cash App
                </label>
              </div>
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
