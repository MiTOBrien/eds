import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    professional: false,
    acknowledgment: false,
    token: '',
  }),
  actions: {
    setUser(user) {
      this.id = user.id
      this.first_name = user.first_name || ''
      this.last_name = user.last_name || ''
      this.email = user.email
      this.professional = user.professional || false
      this.acknowledgment = user.acknowledgment || false
      this.token = user.token

      localStorage.setItem('id', this.id)
      localStorage.setItem('first_name', this.first_name)
      localStorage.setItem('last_name', this.last_name)
      localStorage.setItem('email', this.email)
      localStorage.setItem('professional', this.professional)
      localStorage.setItem('acknowledgment', this.acknowledgment)
      localStorage.setItem('token', this.token)
    },
    logout() {
      this.id = null
      this.first_name = ''
      this.last_name = ''
      this.email = ''
      this.professional = false
      this.acknowledgment = false
      this.token = ''

      localStorage.clear()
    },
    restoreFromLocalStorage() {
      const storedId = localStorage.getItem('id')
      this.id = storedId ? Number(storedId) : null
      this.first_name = localStorage.getItem('first_name') || ''
      this.last_name = localStorage.getItem('last_name') || ''
      this.email = localStorage.getItem('email')
      this.professional = localStorage.getItem('professional') === 'true'
      this.acknowledgment = localStorage.getItem('acknowledgment') === 'true'
      this.token = localStorage.getItem('token')
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
})