<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

const token = computed(() => userStore.token)
const readers = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedRoleFilter = ref('all')
const selectedServiceFilter = ref('all')
const selectedGenreFilter = ref('all')
const availableGenres = ref([])

const roleNameToId = {
  'Arc Reader': 3,
  'Beta Reader': 4,
  'Proof Reader': 5,
}

const fetchReaders = async () => {
  console.log('Fetching readers...')
  try {
    loading.value = true
    error.value = null

    if (!token.value) {
      error.value = 'Please log in to view readers'
      return
    }

    const response = await fetch(`${API_BASE_URL}/readers`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    readers.value = data.readers || []
  } catch (err) {
    console.log('Error fetching readers:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const getReaderRoles = (roles) => {
  if (!Array.isArray(roles)) return ''
  return roles.map((r) => r.name || `Role ${r.id}`).join(', ')
}

const getProfileImageUrl = (reader) => {
  if (reader.profile_picture) {
    return reader.profile_picture.startsWith('http')
      ? reader.profile_picture
      : `${API_BASE_URL}${reader.profile_picture}`
  }
  return 'public/icons8-user-default-64.png'
}

const handleImageError = (event) => {
  const img = event.target
  if (!img.dataset.fallback) {
    img.src = '/default-avatar.png'
    img.dataset.fallback = 'true'
  }
}

const formatSocialLink = (platform, handle) => {
  if (!handle) return null
  const cleanHandle = handle.replace('@', '').trim()
  const urls = {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    x: 'https://x.com/',
  }
  return urls[platform] + cleanHandle
}

const fetchGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/genres`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    availableGenres.value = Array.isArray(data) ? data : data.genres || []
  } catch (err) {
    console.error('Error fetching genres:', err)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRoleFilter.value = 'all'
  selectedServiceFilter.value = 'all'
  selectedGenreFilter.value = 'all'
}

const filteredReaders = computed(() => {
  return readers.value.filter((reader) => {
    const matchesSearch =
      !searchQuery.value ||
      reader.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.bio?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const roleNames = Array.isArray(reader.roles)
      ? reader.roles.map((r) => (typeof r === 'string' ? r : r.role))
      : []

    const matchesRole =
      selectedRoleFilter.value === 'all' ||
      (Array.isArray(reader.roles) &&
        reader.roles.some((r) => r.id === roleNameToId[selectedRoleFilter.value]))

    const matchesService =
      selectedServiceFilter.value === 'all' ||
      (selectedServiceFilter.value === 'free' && !reader.charges_for_services) ||
      (selectedServiceFilter.value === 'paid' && reader.charges_for_services)

    const matchesGenre =
      selectedGenreFilter.value === 'all' ||
      (Array.isArray(reader.genres) &&
        reader.genres.some(
          (g) =>
            g.id === selectedGenreFilter.value ||
            g.subgenres?.some((sub) => sub.id === selectedGenreFilter.value),
        ))

    return matchesSearch && matchesRole && matchesService && matchesGenre
  })
})

onMounted(() => {
  if (token.value) {
    fetchReaders()
    fetchGenres()
  }
})

watchEffect(() => {
  if (userStore.shouldRefreshReaders.value) {
    fetchReaders()
    userStore.resetRefreshFlag()
  }
})
</script>

<template>
  <main class="reader-directory">
    <!-- Header -->
    <div class="header-section">
      <NavbarView />
      <hr />
      <h3>Find Your Perfect Reader</h3>
      <p class="subtitle">Connect with experienced ARC readers, beta readers, and proofreaders</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filters">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, username, or about..."
          class="search-input"
        />
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="role-filter">Reader Type:</label>
          <select v-model="selectedRoleFilter" id="role-filter" class="filter-select">
            <option value="all">All Types</option>
            <option value="Arc Reader">ARC Readers</option>
            <option value="Beta Reader">Beta Readers</option>
            <option value="Proof Reader">Proof Readers</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="service-filter">Service Type:</label>
          <select v-model="selectedServiceFilter" id="service-filter" class="filter-select">
            <option value="all">All Services</option>
            <option value="free">Free Services</option>
            <option value="paid">Paid Services</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="genre-filter">Genre Type:</label>
          <select v-model="selectedGenreFilter" id="genre-filter" class="filter-select">
            <option value="all">All Genres</option>
            <option v-for="genre in availableGenres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>

        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info" v-if="!loading">
      <p>{{ filteredReaders.length }} reader{{ filteredReaders.length !== 1 ? 's' : '' }} found</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading.value" class="loading-state">
      <p>Loading readers...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>Error loading readers: {{ error }}</p>
      <button @click="fetchReaders" class="retry-btn">Try Again</button>
    </div>

    <!-- Readers Grid -->
    <div v-else-if="filteredReaders.length > 0" class="readers-grid">
      <div v-for="reader in filteredReaders" :key="reader.id" class="reader-card">
        <!-- Profile Photo -->
        <div class="reader-photo">
          <img
            :src="getProfileImageUrl(reader)"
            :alt="`${reader.first_name} ${reader.last_name}`"
            @error="handleImageError"
          />
        </div>

        <!-- Reader Info -->
        <div class="reader-info">
          <h3 :class="['reader-name', { hidden: reader.hide_name }]">
            {{
              reader.hide_name
                ? 'Name hidden by reader'
                : `${reader.first_name} ${reader.last_name}`
            }}
          </h3>
          <p class="reader-username"><strong>Username:</strong> {{ reader.username }}</p>
          <p class="reader-roles">{{ getReaderRoles(reader.roles) }}</p>
          <p class="service-type" :class="{ 'paid-service': reader.charges_for_services }">
            {{ reader.charges_for_services ? 'Paid Services' : 'Free Services' }}
          </p>

          <!-- Contact Info -->
          <p class="email">
            <strong>Contact Email: </strong>
            <a :href="`mailto:${reader.email}`">{{ reader.email }}</a>
          </p>

          <!-- Turnaround Time -->
          <p class="turnaround-time">
            <strong>Estimated Turnaround Time:</strong> {{ reader.turnaround_time_label }}
          </p>

          <!-- Pricing Tiers -->
          <div
            v-if="reader.charges_for_services && reader.pricing_tiers?.length"
            class="pricing-display"
          >
            <strong>Pricing Tiers:</strong>
            <ul class="pricing-list">
              <li v-for="(tier, index) in reader.pricing_tiers" :key="index">
                Up to {{ tier.word_count.toLocaleString() }} words: ${{
                  (tier.price_cents / 100).toFixed(2)
                }}
              </li>
            </ul>
          </div>

          <!-- Payment Options -->
          <div
            v-if="Array.isArray(reader.payment_options) && reader.payment_options.length"
            class="payment-display"
          >
            <strong>Preferred Payment Methods:</strong>
            <ul>
              <li v-for="method in reader.payment_options" :key="method">{{ method }}</li>
            </ul>
          </div>

          <!-- Genre & Subgenre Display -->
          <div v-if="reader.genres && reader.genres.length" class="genre-display">
            <strong>Preferred Genres:</strong>
            <div class="genre-tags">
              <span v-for="genre in reader.genres" :key="genre.id" class="genre-tag">
                {{ genre.name }}
                <span v-for="sub in genre.subgenres" :key="sub.id" class="subgenre-tag">
                  • {{ sub.name }}
                </span>
              </span>
            </div>
          </div>

          <!-- Bio -->
          <p><strong>About:</strong></p>
          <p v-if="reader.bio" class="reader-bio">{{ reader.bio }}</p>

          <!-- Social Links -->
          <div class="social-links" v-if="reader.facebook || reader.instagram || reader.x">
            <h4>Social Media</h4>
            <ul class="social-list">
              <li v-if="reader.facebook">
                <strong>Facebook: </strong>
                <a
                  :href="formatSocialLink('facebook', reader.facebook)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ formatSocialLink('facebook', reader.facebook) }}
                </a>
              </li>
              <li v-if="reader.instagram">
                <strong>Instagram: </strong>
                <a
                  :href="formatSocialLink('instagram', reader.instagram)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ formatSocialLink('instagram', reader.instagram) }}
                </a>
              </li>
              <li v-if="reader.x">
                <strong>X: </strong>
                <a
                  :href="formatSocialLink('x', reader.x)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ formatSocialLink('x', reader.x) }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results">
      <p>No readers found matching your criteria.</p>
      <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
    </div>
  </main>
</template>

<style scoped>
.reader-directory {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-section h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

/* Search and Filters */
.search-filters {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.clear-filters-btn:hover {
  background: #545b62;
}

/* Results Info */
.results-info {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

/* Loading and Error States */
.loading-state,
.error-state,
.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #0056b3;
}

/* Readers Grid */
.readers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.reader-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.reader-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.reader-photo {
  text-align: center;
  margin-bottom: 1rem;
}

.reader-photo img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.reader-header {
  text-align: center;
  margin-bottom: 1rem;
}

.reader-name {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.2rem;
}

.reader-name.hidden {
  font-style: italic;
  color: #777;
}

.reader-username {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.reader-roles {
  color: #007bff;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.service-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #28a745;
  color: white;
}

.service-type.paid-service {
  background: #ffc107;
  color: #333;
}

.contact-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.email a {
  color: #007bff;
  text-decoration: none;
}

.email a:hover {
  text-decoration: underline;
}

.pricing-display,
.payment-display {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: #333;
}

.pricing-display strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.pricing-list {
  padding-left: 1rem;
  list-style-type: disc;
}

.reader-bio {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.genre-display {
  margin: 1rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.genre-display strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.95rem;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.genre-tag {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  color: #007bff;
  font-weight: 600;
}

.subgenre-tag {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
}

.reader-bio p {
  margin: 0;
  line-height: 1.5;
  color: #555;
}

.social-links h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.9rem;
}

.social-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.social-link:hover {
  opacity: 0.8;
}

.social-link.facebook {
  background: #1877f2;
  color: white;
}

.social-link.instagram {
  background: #e4405f;
  color: white;
}

.social-link.x {
  background: #000;
  color: white;
}

.social-icon {
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reader-directory {
    padding: 1rem;
  }

  .readers-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .search-filters {
    padding: 1rem;
  }

  .reader-card {
    padding: 1rem;
  }

  .social-buttons {
    justify-content: center;
  }
}
</style>
