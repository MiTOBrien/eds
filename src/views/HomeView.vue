<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

// Reactive data
const token = computed(() => userStore.token)
const readers = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedRoleFilter = ref('all')
const selectedServiceFilter = ref('all')


// Computed properties
const filteredReaders = computed(() => {
  return readers.value.filter((reader) => {
    const matchesSearch =
      searchQuery.value === '' ||
      reader.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      reader.bio?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const roleNames = Array.isArray(reader.roles)
      ? reader.roles.map((r) => (typeof r === 'string' ? r : r.role))
      : []

    const matchesRole =
      selectedRoleFilter.value === 'all' ||
      roleNames.includes(selectedRoleFilter.value)

    const matchesService =
      selectedServiceFilter.value === 'all' ||
      (selectedServiceFilter.value === 'free' && !reader.charges_for_services) ||
      (selectedServiceFilter.value === 'paid' && reader.charges_for_services)

    return matchesSearch && matchesRole && matchesService
  })
})

// Methods
const fetchReaders = async () => {
  try {
    loading.value = true
    error.value = null

    if (!userStore.token) {
      error.value = 'Please log in to view readers'
      return
    }

    const response = await fetch(`${API_BASE_URL}/readers`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const data = await response.json()
    readers.value = data.readers || []
  } catch (err) {
    error.value = err.message
    console.error('Error fetching readers:', err)
  } finally {
    loading.value = false
  }
}

const getReaderRoles = (roles) => {
  const roleLabels = {
    arcreader: 'ARC Reader',
    betareader: 'Beta Reader',
    proofreader: 'Proofreader',
  }

  return roles
    .filter((role) => ['arcreader', 'betareader', 'proofreader'].includes(role))
    .map((role) => roleLabels[role])
    .join(', ')
}

const getProfileImageUrl = (reader) => {
  if (reader.profile_photo) {
    // If it's a full URL, use as-is; otherwise, prepend base URL
    return reader.profile_photo.startsWith('http')
      ? reader.profile_photo
      : `${API_BASE_URL}${reader.profile_photo}`
  }
  return '/default-avatar.png'
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

  const baseUrls = {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    x: 'https://x.com/',
  }

  // Remove @ if present and clean the handle
  const cleanHandle = handle.replace('@', '').trim()
  return baseUrls[platform] + cleanHandle
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRoleFilter.value = 'all'
  selectedServiceFilter.value = 'all'
}

// Lifecycle
onMounted(() => {
  if (userStore.token) fetchReaders()
})

onUnmounted(() => {
  console.log('HomeView unmounted')
})
</script>

<template>
  <main class="reader-directory">
    <div class="header-section">
      <NavbarView />
      <hr />
      <h3>Find Your Perfect Reader</h3>
      <p class="subtitle">Connect with experienced ARC readers, beta readers, and proofreaders</p>
      <p v-if="token">Token: {{ token }}</p>
      <p v-else>No token found</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filters">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, username, or bio..."
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
            <option value="Proof Reader">Proofreaders</option>
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

        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info" v-if="!loading">
      <p>{{ filteredReaders.length }} reader{{ filteredReaders.length !== 1 ? 's' : '' }} found</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
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
            @error="handleImageError($event)"
          />
        </div>

        <!-- Reader Info -->
        <div class="reader-info">
          <div class="reader-header">
            <h3 class="reader-name">{{ reader.first_name }} {{ reader.last_name }}</h3>
            <p class="reader-username">@{{ reader.username }}</p>
            <div class="reader-roles">
              {{ getReaderRoles(reader.roles) }}
            </div>
            <div class="service-type" :class="{ 'paid-service': reader.charges_for_services }">
              {{ reader.charges_for_services ? 'Paid Services' : 'Free Services' }}
            </div>
          </div>

          <!-- Contact Info -->
          <div class="contact-info">
            <p class="email">
              <strong>Email:</strong>
              <a :href="`mailto:${reader.email}`">{{ reader.email }}</a>
            </p>
          </div>

          <!-- Bio -->
          <div v-if="reader.bio" class="reader-bio">
            <p>{{ reader.bio }}</p>
          </div>

          <!-- Social Links -->
          <div
            class="social-links"
            v-if="reader.facebook_handle || reader.instagram_handle || reader.x_handle"
          >
            <h4>Connect:</h4>
            <div class="social-buttons">
              <a
                v-if="reader.facebook_handle"
                :href="formatSocialLink('facebook', reader.facebook_handle)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link facebook"
              >
                <span class="social-icon">📘</span>
                Facebook
              </a>

              <a
                v-if="reader.instagram_handle"
                :href="formatSocialLink('instagram', reader.instagram_handle)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link instagram"
              >
                <span class="social-icon">📷</span>
                Instagram
              </a>

              <a
                v-if="reader.x_handle"
                :href="formatSocialLink('x', reader.x_handle)"
                target="_blank"
                rel="noopener noreferrer"
                class="social-link x"
              >
                <span class="social-icon">𝕏</span>
                X (Twitter)
              </a>
            </div>
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

.reader-bio {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
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
