import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(null)
  const id = ref(null)
  const username = ref('')
  const email = ref('')
  const first_name = ref('')
  const last_name = ref('')
  const hide_name = ref(false)
  const professional = ref(false)
  const bio = ref('')
  const profile_picture = ref('')
  const facebook_handle = ref('')
  const instagram_handle = ref('')
  const x_handle = ref('')
  const roles = ref([])
  const userGenres = ref([])
  const isLoggedIn = ref(false)
  const shouldRefreshReaders = ref(false)
  const charges_for_services = ref(false)
  const turnaround_time_label = ref(0)
  const pricingTiers = ref([])
  const payment_options = ref([])
  const disabled = ref(false)

  // Actions
  function login(userData) {
    token.value = userData.token
    id.value = userData.id
    username.value = userData.username
    email.value = userData.email
    first_name.value = userData.first_name
    last_name.value = userData.last_name
    hide_name.value = userData.hide_name || false
    professional.value = userData.professional || false
    bio.value = userData.bio || ''
    profile_picture.value = userData.profile_picture || ''
    facebook_handle.value = userData.facebook || ''
    instagram_handle.value = userData.instagram || ''
    x_handle.value = userData.x || ''
    roles.value = Array.isArray(userData.roles)
      ? userData.roles.map((role) => (typeof role === 'object' ? role.id : role))
      : []
    userGenres.value = Array.isArray(userData.genres) ? userData.genres : []
    charges_for_services.value = !!userData.charges_for_services
    turnaround_time_label.value = userData.turnaround_time_label || 0
    pricingTiers.value = Array.isArray(userData.pricing_tiers)
      ? userData.pricing_tiers.map((tier) => ({
          id: tier.id,
          wordCount: tier.word_count,
          price: tier.price_cents / 100,
          currency: tier.currency,
        }))
      : []
    payment_options.value = Array.isArray(userData.payment_options) ? userData.payment_options : []
    disabled.value = !!userData.disabled
    isLoggedIn.value = true

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...userData,
        roles: roles.value,
        genres: userGenres.value,
        pricing_tiers: pricingTiers.value,
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
    hide_name.value = false
    professional.value = false
    bio.value = ''
    profile_picture.value = ''
    facebook_handle.value = ''
    instagram_handle.value = ''
    x_handle.value = ''
    roles.value = []
    userGenres.value = []
    charges_for_services.value = false
    turnaround_time_label.value = 0
    pricingTiers.value = []
    payment_options.value = []
    disabled.value = false
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

      // ✅ Transform pricing tiers before login
      if (Array.isArray(userData.pricing_tiers)) {
        userData.pricing_tiers = userData.pricing_tiers.map((tier) => ({
          id: tier.id,
          wordCount: tier.word_count,
          price: tier.price_cents / 100,
          currency: tier.currency,
        }))
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
    hide_name,
    professional,
    bio,
    profile_picture,
    facebook_handle,
    instagram_handle,
    x_handle,
    roles,
    userGenres,
    isLoggedIn,
    shouldRefreshReaders,
    charges_for_services,
    turnaround_time_label,
    pricingTiers,
    disabled,
    payment_options,

    // Actions
    login,
    setUser,
    logout,
    restoreFromLocalStorage,
    resetRefreshFlag,
  }
})
