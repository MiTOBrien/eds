<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavbarView from './NavbarView.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => {
  return authStore.user?.roles?.includes('Admin')
})

onMounted(() => {
  // Double-check on component mount
  if (!isAdmin.value) {
    router.push('/unauthorized')
  }
})
</script>

<template>
  <main v-if="isAdmin">
    <NavbarView />
    <h3>Admin Page</h3>
    <p>List all users</p>
    <p>List all authors</p>
  </main>
  <div v-else>
    <p>Access denied. Redirecting...</p>
  </div>
</template>