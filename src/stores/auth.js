import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token')
  }),

  getters: {
    isAdmin: (state) => state.user?.roles?.includes('Admin'),
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async fetchUser() {
      if (this.token) {
        try {
          const response = await axios.get('/api/user', {
            headers: { Authorization: `Bearer ${this.token}` }
          })
          this.user = response.data
        } catch (error) {
          this.logout()
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
