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

const isOpen = ref(false)

const ADMIN_ROLE_ID = 1
const isAdmin = computed(
  () => Array.isArray(userStore.roles) && userStore.roles.includes(ADMIN_ROLE_ID),
)

const allowedRoles = [3, 4, 5]
const canViewSubscriptions = computed(
  () =>
    Array.isArray(userStore.roles) && userStore.roles.some((role) => allowedRoles.includes(role)),
)

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

const changePassword = () => {
  closeDropdown()
  router.push('/change-password')
}

const faq = () => {
  closeDropdown()
  router.push('/faq')
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
  <div>
    <nav class="navbar">
      <!-- Hamburger menu for mobile -->
      <button class="hamburger" @click="isOpen = !isOpen">☰</button>
      <!-- Left side - Home button -->
      <div class="navbar-left navbar-links" :class="{ open: isOpen }">
        <RouterLink class="nav-link home-link" to="/home">Home</RouterLink>
        <RouterLink class="nav-link" to="/profile">Profile</RouterLink>
        <RouterLink v-if="canViewSubscriptions" class="nav-link" to="/subscriptions"
          >Subscriptions</RouterLink
        >
        <router-link v-if="isAdmin" to="/admin" class="nav-link">Admin Panel</router-link>
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
              <button class="dropdown-item" @click="changePassword">Change Password</button>
              <button class="dropdown-item" @click="faq">FAQ</button>
              <button class="dropdown-item" @click="logout">Logout</button>
            </div>
          </div>
        </template>

        <template v-else>
          <RouterLink class="nav-link login-link" to="/">Login</RouterLink>
        </template>
      </div>
    </nav>
  </div>
  <h1>Early Draft Society</h1>
  <h2>Building Better Books Together</h2>
</template>

<style scoped>
.hamburger {
  display: none;
  font-size: 2rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.navbar-links {
  display: flex;
  gap: 1rem;
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .navbar-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: #1e3a8a;
    padding: 1rem;
    z-index: 999;
  }

  .navbar-links.open {
    display: flex;
  }
}
</style>
