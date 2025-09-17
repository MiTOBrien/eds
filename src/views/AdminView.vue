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

// State
const users = ref([])
const authors = ref([])
const searchQuery = ref('')
const selectedRole = ref('')

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

const filteredUsers = computed(() =>
  users.value.filter(
    (user) =>
      (!selectedRole.value || user.roles.includes(selectedRole.value)) &&
      (user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())),
  ),
)

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

      <div class="filter-controls">
        <input v-model="searchQuery" placeholder="Search by name or email" />
        <select v-model="selectedRole">
          <option value="">All Roles</option>
          <option value="Author">Author</option>
          <option value="Arc Reader">Arc Reader</option>
          <option value="Beta Reader">Beta Reader</option>
          <option value="Proof Reader">Proof Reader</option>
        </select>
      </div>

      <!-- Admin Content -->
      <div v-if="!loading && !error" class="admin-content">
        <!-- Users Section -->
        <section class="admin-section">
          <h4>Users ({{ users.length }})</h4>
          <div v-if="users.length === 0" class="empty-state">No users found</div>
          <ul v-if="filteredUsers.length" class="admin-list">
            <li v-for="user in filteredUsers" :key="user.id" class="admin-item">
              <strong>{{ user.name || user.email }}</strong>
              <span class="user-email">{{ user.email }}</span>
              <span class="user-roles">{{ user.roles?.join(', ') || 'No roles' }}</span>
            </li>
          </ul>
        </section>

        <!-- Authors Section -->
        <section class="admin-section">
          <h4>Authors ({{ authors.length }})</h4>
          <div v-if="authors.length === 0" class="empty-state">No authors found</div>
          <ul v-else class="admin-list">
            <li v-for="author in authors" :key="author.id" class="admin-item">
              <strong>{{ author.name }}</strong>
              <span class="author-bio">{{ author.bio || 'No bio' }}</span>
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

.admin-list {
  list-style: none;
  padding: 0;
}

.admin-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
  background: white;
  margin-bottom: 10px;
  border-radius: 4px;
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

</style>
