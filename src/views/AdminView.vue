<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useUserStore } from '@/stores/useUserStore'
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const userStore = useUserStore()

const token = computed(() => userStore.token)
const router = useRouter()
const { loading, error, get } = useApi()

const roleNameToId = {
  Author: 2,
  'Arc Reader': 3,
  'Beta Reader': 4,
  'Proof Reader': 5,
}

// State
const users = ref([])
const authors = ref([])
const searchQuery = ref('')
const selectedRoleFilter = ref('all')
const selectedServiceFilter = ref('all')

// Computed property to check if the user has the 'Admin' role
const ADMIN_ROLE_ID = 1
const isAdmin = computed(
  () => Array.isArray(userStore.roles) && userStore.roles.includes(ADMIN_ROLE_ID),
)

// // Methods
const fetchUsers = async () => {
  console.log('Fetching users...')
  try {
    loading.value = true
    error.value = null

    if (!token.value) {
      error.value = 'Please log in to view users'
      return
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    users.value = Array.isArray(data) ? data : data.users || []
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const roleSummary = ref([])

const fetchRoleSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/role_summary`, {
    headers: {
      Authorization: `Bearer ${token.value}`,
      Accept: 'application/json',
    },
  })
  const data = await response.json()
  roleSummary.value = data.summary || []
}

const refreshData = async () => {
  await Promise.all([fetchUsers()])
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRoleFilter.value = 'all'
  selectedServiceFilter.value = 'all'
}

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      !searchQuery.value ||
      user.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole =
      selectedRoleFilter.value === 'all' ||
      (Array.isArray(user.roles) &&
        user.roles.some((r) => r.id === roleNameToId[selectedRoleFilter.value]))

    const matchesService =
      selectedServiceFilter.value === 'all' ||
      (selectedServiceFilter.value === 'free' && !user.charges_for_services) ||
      (selectedServiceFilter.value === 'paid' && user.charges_for_services)

    return matchesSearch && matchesRole && matchesService
  })
})

// Lifecycle
onMounted(async () => {
  // Double-check admin access
  if (!isAdmin.value) {
    router.push('/unauthorized')
    return
  }

  // Fetch initial data
  await refreshData()
  await fetchRoleSummary()
})
</script>

<template>
  <main v-if="isAdmin">
    <NavbarView />

    <div class="admin-container">
      <h3>Admin Dashboard</h3>

      <!-- Loading State -->
      <div v-if="loading" class="loading">Loading admin data...</div>

      <!-- Error State -->
      <div v-if="error" class="error">
        Error: {{ error }}
        <button @click="refreshData">Retry</button>
      </div>

      <div class="role-cards">
        <div v-for="role in roleSummary" :key="role.role" class="role-card">
          <h4>{{ role.role }}</h4>
          <p>{{ role.count }} users</p>
        </div>
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
              <option value="Author">Authors</option>
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

          <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
        </div>
      </div>

      <!-- Admin Content -->
      <div v-if="!loading && !error" class="admin-content">
        <!-- Users Section -->
        <section class="admin-section">
          <h4>Users ({{ filteredUsers.length }})</h4>
          <div v-if="filteredUsers.length === 0" class="empty-state">No users found</div>
          <ul v-if="filteredUsers.length" class="admin-card-grid">
            <li v-for="user in filteredUsers" :key="user.id" class="admin-card">
              <div class="card-line"><strong>Username:</strong> {{ user.username || '—' }}</div>
              <div class="card-line"><strong>Email:</strong> {{ user.email || '—' }}</div>
              <div class="card-line">
                <strong>Roles:</strong>
                <span v-if="user.roles?.length">
                  {{ user.roles.map((r) => r.role).join(', ') }}
                </span>
                <span v-else>No roles</span>
              </div>
            </li>
          </ul>
        </section>

        <!-- Refresh Button -->
        <button @click="refreshData" class="refresh-btn">Refresh Data</button>
      </div>
    </div>
  </main>

  <!-- Access Denied -->
  <div v-else class="access-denied">
    <h3>Access Denied</h3>
    <p>You don't have permission to view this page. Redirecting...</p>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-section {
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.admin-card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 0;
  list-style: none;
}

.admin-card {
  flex: 1 1 calc(33.333% - 20px); /* 3 cards across */
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 250px;
  max-width: 300px;
}

.user-email {
  color: #6c757d;
  font-size: 0.9em;
}

.user-roles {
  color: #495057;
  font-size: 0.85em;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
  align-self: flex-start;
}

.author-bio {
  color: #6c757d;
  font-size: 0.9em;
  font-style: italic;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  border-radius: 4px;
}

.refresh-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #0056b3;
}

.access-denied {
  text-align: center;
  padding: 50px 20px;
  color: #dc3545;
}

.role-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.role-card {
  background: #f1f3f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  flex: 1;
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

@media (max-width: 900px) {
  .admin-card {
    flex: 1 1 calc(50% - 20px); /* 2 cards across */
  }
}

@media (max-width: 600px) {
  .admin-card {
    flex: 1 1 100%; /* 1 card per row */
  }
}
</style>
