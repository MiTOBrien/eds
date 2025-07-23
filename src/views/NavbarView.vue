<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const headerText = ref(null)
const router = useRouter()
const userStore = useUserStore()
const isDropdownOpen = ref(false)

const username = computed(() => userStore.username || userStore.name || userStore.email)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const changeHeader = () => {
  if (headerText.value) {
    headerText.value.textContent = 'Cipher Genius'
  }
}

const logout = () => {
  userStore.logout()
  router.push('/')
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    closeDropdown()
  }
}

onMounted(() => {
  setTimeout(changeHeader, 1500)
  userStore.restoreFromLocalStorage()
})
</script>

<template>
  <nav>
    <div class="left-nav">
      <RouterLink class="nav-link" to="/home">Home</RouterLink>
      <RouterLink class="nav-link" to="/about">About Ciphers</RouterLink>
      <div class="dropdown">
        <button 
          class="nav-link dropdown-toggle" 
          @click="toggleDropdown"
          :class="{ active: isDropdownOpen }"
        >
          Ciphers
          <span class="dropdown-arrow" :class="{ rotated: isDropdownOpen }">▼</span>
        </button>
        
        <div class="dropdown-menu" :class="{ show: isDropdownOpen }">
          <RouterLink 
            class="dropdown-item" 
            to="/caesar" 
            @click="closeDropdown"
          >
            Caesar Cipher
          </RouterLink>
          <RouterLink 
            class="dropdown-item" 
            to="/atbash" 
            @click="closeDropdown"
          >
            Atbash Cipher
          </RouterLink>
        </div>
      </div>
      <template v-if="isLoggedIn">
        <RouterLink class="nav-link" to="/profile">{{ username }}</RouterLink>
      </template>
    </div>

    <div class="right-nav">
      <template v-if="isLoggedIn">
        <button class="nav-button" @click="logout">Logout</button>
      </template>
      <template v-else>
        <RouterLink class="nav-link" to="/">Login</RouterLink>
      </template>
    </div>
  </nav>
  <h1 ref="headerText">Djqifs Hfojvt</h1>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
h1 {
  font-size: 4rem;
  text-align: center;
  color: #01bfff;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #241822;
}

.nav-link {
  margin: 0 10px;
  padding: 5px;
  color: #01bfff;
  text-decoration: none;
}

.left-nav {
  display: flex;
  align-items: center;
}

.right-nav {
  display: flex;
  align-items: center;
}

.nav-button {
  background: none;
  border: none;
  color: #01bfff;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 10px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #01bfff;
  font-size: 1rem;
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dropdown-toggle:hover,
.dropdown-toggle.active {
  color: #84ce00;
}

.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #241822;
  border: 1px solid #01bfff;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  min-width: 160px;
  z-index: 1000;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 10px 15px;
  color: #01bfff;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(1, 191, 255, 0.1);
  color: #84ce00;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

/* Active route styling for dropdown items */
.dropdown-item.router-link-active {
  background-color: rgba(132, 206, 0, 0.2);
  color: #84ce00;
}
</style>
