import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    professional: false,
    bio: '',
    profile_picture: '',
    facebook: '',
    instagram: '',
    x: '',
    isLoggedIn: false,
    roles: [],
  }),
  actions: {
    login(userData) {
      this.token = userData.token
      this.username = userData.username
      this.email = userData.email
      this.first_name = userData.first_name
      this.last_name = userData.last_name
      this.professional = userData.professional || false
      this.bio = userData.bio || ''
      this.profile_picture = userData.profile_picture || ''
      this.facebook = userData.facebook || ''
      this.instagram = userData.instagram || ''
      this.x = userData.x || ''
      this.roles = userData.roles || [] 
      this.isLoggedIn = true

      localStorage.setItem('user', JSON.stringify(userData))
    },

    setUser(userData) {
      this.login(userData)
    },

    logout() {
      this.token = null
      this.username = ''
      this.email = ''
      this.first_name = ''
      this.last_name = ''
      this.professional = false
      this.bio = ''
      this.profile_picture = ''
      this.facebook = ''
      this.instagram = ''
      this.x = ''
      this.roles = []
      this.isLoggedIn = false

      localStorage.removeItem('user')
    },

    restoreFromLocalStorage() {
      const stored = localStorage.getItem('user')
      if (stored) {
        const userData = JSON.parse(stored)
        this.token = userData.token
        this.username = userData.username
        this.email = userData.email
        this.first_name = userData.first_name
        this.last_name = userData.last_name
        this.professional = userData.professional || false
        this.bio = userData.bio || ''
        this.profile_picture = userData.profile_picture || ''
        this.facebook = userData.facebook || ''
        this.instagram = userData.instagram || ''
        this.x = userData.x || ''
        this.roles = userData.roles || []
        this.isLoggedIn = true
      }
    },
  },
})
