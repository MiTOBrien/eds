import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(null)
  const id = ref(null)
  const username = ref('')
  const email = ref('')
  const first_name = ref('')
  const last_name = ref('')
  const professional = ref(false)
  const bio = ref('')
  const profile_picture = ref('')
  const facebook_handle = ref('')
  const instagram_handle = ref('')
  const x_handle = ref('')
  const roles = ref([])
  const genres = ref([])
  const isLoggedIn = ref(false)
  const shouldRefreshReaders = ref(false)

  // Actions
  function login(userData) {
    token.value = userData.token
    id.value = userData.id
    username.value = userData.username
    email.value = userData.email
    first_name.value = userData.first_name
    last_name.value = userData.last_name
    professional.value = userData.professional || false
    bio.value = userData.bio || ''
    profile_picture.value = userData.profile_picture || ''
    facebook_handle.value = userData.facebook || ''
    instagram_handle.value = userData.instagram || ''
    x_handle.value = userData.x || ''
    roles.value = Array.isArray(userData.roles)
      ? userData.roles.map((role) => (typeof role === 'object' ? role.id : role))
      : []
    genres.value = Array.isArray(userData.genres)
      ? userData.genres.map((genre) => (typeof genre === 'object' ? genre.id : genre))
      : []
    isLoggedIn.value = true

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...userData,
        roles: roles.value,
      }),
    )
  }

  function setUser(userData) {
    const currentToken = token.value
    login({
      ...userData,
      token: userData.token || currentToken,
    })
    shouldRefreshReaders.value = true
  }

  function logout() {
    token.value = null
    id.value = null
    username.value = ''
    email.value = ''
    first_name.value = ''
    last_name.value = ''
    professional.value = false
    bio.value = ''
    profile_picture.value = ''
    facebook_handle.value = ''
    instagram_handle.value = ''
    x_handle.value = ''
    roles.value = []
    genres.value = []
    isLoggedIn.value = false

    localStorage.removeItem('user')
  }

  function restoreFromLocalStorage() {
    const stored = localStorage.getItem('user')
    if (stored) {
      const userData = JSON.parse(stored)

      if (userData.token) {
        token.value = userData.token
      }

      login(userData)
    }
  }

  function resetRefreshFlag() {
    shouldRefreshReaders.value = false
  }

  return {
    // State
    token,
    id,
    username,
    email,
    first_name,
    last_name,
    professional,
    bio,
    profile_picture,
    facebook_handle,
    instagram_handle,
    x_handle,
    roles,
    genres,
    isLoggedIn,
    shouldRefreshReaders,

    // Actions
    login,
    setUser,
    logout,
    restoreFromLocalStorage,
    resetRefreshFlag,
  }
})
