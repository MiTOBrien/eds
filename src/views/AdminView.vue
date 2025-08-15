<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth' // Adjust path as needed
import NavbarView from './NavbarView.vue'

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL
const router = useRouter()
const authStore = useAuthStore()
const { loading, error, get } = useApi()

// State
const users = ref([])
const authors = ref([])

// Computed
const isAdmin = computed(() => {
  return authStore.user?.roles?.includes('Admin')
})

// Methods
const fetchUsers = async () => {
  try {
    users.value = await get(`${API_BASE_URL}/users`)
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
}

const fetchAuthors = async () => {
  try {
    authors.value = await get('/authors')
  } catch (err) {
    console.error('Failed to fetch authors:', err)
  }
}

const refreshData = async () => {
  await Promise.all([
    fetchUsers(),
    fetchAuthors()
  ])
}

// Lifecycle
onMounted(async () => {
  // Double-check admin access
  if (!isAdmin.value) {
    router.push('/unauthorized')
    return
  }
  
  // Fetch initial data
  await refreshData()
})
</script>

<template>
  <main v-if="isAdmin">
    <NavbarView />
    
    <div class="admin-container">
      <h3>Admin Dashboard</h3>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading admin data...
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error">
        Error: {{ error }}
        <button @click="refreshData">Retry</button>
      </div>
      
      <!-- Admin Content -->
      <div v-if="!loading && !error" class="admin-content">
        <!-- Users Section -->
        <section class="admin-section">
          <h4>Users ({{ users.length }})</h4>
          <div v-if="users.length === 0" class="empty-state">
            No users found
          </div>
          <ul v-else class="admin-list">
            <li v-for="user in users" :key="user.id" class="admin-item">
              <strong>{{ user.name || user.email }}</strong>
              <span class="user-email">{{ user.email }}</span>
              <span class="user-roles">{{ user.roles?.join(', ') || 'No roles' }}</span>
            </li>
          </ul>
        </section>
        
        <!-- Authors Section -->
        <section class="admin-section">
          <h4>Authors ({{ authors.length }})</h4>
          <div v-if="authors.length === 0" class="empty-state">
            No authors found
          </div>
          <ul v-else class="admin-list">
            <li v-for="author in authors" :key="author.id" class="admin-item">
              <strong>{{ author.name }}</strong>
              <span class="author-bio">{{ author.bio || 'No bio' }}</span>
            </li>
          </ul>
        </section>
        
        <!-- Refresh Button -->
        <button @click="refreshData" class="refresh-btn">
          Refresh Data
        </button>
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

.loading, .error, .empty-state {
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
</style>