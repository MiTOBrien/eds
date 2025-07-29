import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    roles: [],
    professional: false,
    acknowledgment: false,
    bio: '',
    facebook: '',
    twitter: '',
    x: '',
    token: '',
  }),
  actions: {
    setUser(user) {
      this.id = user.id
      this.first_name = user.first_name || ''
      this.last_name = user.last_name || ''
      this.username = user.username || ''
      this.email = user.email
      this.roles = user.roles || []
      this.bio = user.bio || ''
      this.professional = user.professional || false
      this.acknowledgment = user.acknowledgment || false
      this.facebook = user.facebook || ''
      this.instagram = user.instagram || ''
      this.x = user.x || ''
      this.token = user.token

      localStorage.setItem('id', this.id)
      localStorage.setItem('first_name', this.first_name)
      localStorage.setItem('last_name', this.last_name)
      localStorage.setItem('username', this.username)
      localStorage.setItem('email', this.email)
      localStorage.setItem('roles', JSON.stringify(this.roles))
      localStorage.setItem('bio', this.bio)
      localStorage.setItem('professional', this.professional)
      localStorage.setItem('acknowledgment', this.acknowledgment)
      localStorage.setItem('facebook', this.facebook)
      localStorage.setItem('instagram', this.instagram)
      localStorage.setItem('x', this.x)
      localStorage.setItem('token', this.token)
    },
    logout() {
      this.id = null
      this.first_name = ''
      this.last_name = ''
      this.username = ''
      this.email = ''
      this.roles = []
      this.bio = ''
      this.professional = false
      this.acknowledgment = false
      this.facebook = ''
      this.instagram = ''
      this.x = ''
      this.token = ''

      localStorage.clear()
    },
    restoreFromLocalStorage() {
      const storedId = localStorage.getItem('id')
      this.id = storedId ? Number(storedId) : null
      this.first_name = localStorage.getItem('first_name') || ''
      this.last_name = localStorage.getItem('last_name') || ''
      this.username = localStorage.getItem('username') || ''
      this.email = localStorage.getItem('email')
      this.roles = JSON.parse(localStorage.getItem('roles')) || []
      this.bio = localStorage.getItem('bio') || ''
      this.professional = localStorage.getItem('professional') === 'true'
      this.acknowledgment = localStorage.getItem('acknowledgment') === 'true'
      this.facebook = localStorage.getItem('facebook') || ''
      this.instagram = localStorage.getItem('instagram') || ''
      this.x = localStorage.getItem('x') || ''
      this.token = localStorage.getItem('token')
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
})
