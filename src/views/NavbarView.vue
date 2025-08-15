<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const router = useRouter()
const userStore = useUserStore()
const isDropdownOpen = ref(false)

const username = computed(() => userStore.username)
const firstName = computed(() => userStore.first_name)
const lastName = computed(() => userStore.last_name)
const email = computed(() => userStore.email)

// Computed property to get the display name (username, full name, or email as fallback)
const displayName = computed(() => {
  if (username.value) return username.value
  if (firstName.value && lastName.value) {
    return `${firstName.value} ${lastName.value}`
  }
  return email.value || 'User'
})

const isLoggedIn = computed(() => userStore.isLoggedIn)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const logout = () => {
  userStore.logout()
  closeDropdown()
  router.push('/')
}

const viewProfile = () => {
  closeDropdown()
  router.push('/profile')
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-dropdown')) {
    closeDropdown()
  }
}

onMounted(async () => {
  await userStore.restoreFromLocalStorage()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav class="navbar">
    <!-- Left side - Home button -->
    <div class="navbar-left">
      <RouterLink class="nav-link home-link" to="/home">Home</RouterLink>
    </div>

    <!-- Right side - User dropdown or login -->
    <div class="navbar-right">
      <template v-if="isLoggedIn">
        <div class="user-dropdown">
          <button class="user-button" @click="toggleDropdown" :class="{ active: isDropdownOpen }">
            {{ displayName }}
            <span class="dropdown-arrow" :class="{ rotated: isDropdownOpen }">▼</span>
          </button>

          <div class="dropdown-menu" :class="{ show: isDropdownOpen }">
            <button class="dropdown-item" @click="viewProfile">View Profile</button>
            <button class="dropdown-item" @click="logout">Logout</button>
          </div>
        </div>
      </template>

      <template v-else>
        <RouterLink class="nav-link login-link" to="/">Login</RouterLink>
      </template>
    </div>
  </nav>
  <h1>Early Draft Society</h1>
  <h2>Building Better Books Together</h2>
</template>

<style scoped></style>
