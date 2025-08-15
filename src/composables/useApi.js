import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const router = useRouter()

  const apiCall = async (endpoint, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      })

      // Handle unauthorized access
      if (response.status === 403 || response.status === 401) {
        router.push('/unauthorized')
        throw new Error('Unauthorized access')
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Convenience methods
  const get = (endpoint) => apiCall(endpoint)
  
  const post = (endpoint, data) => apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  
  const put = (endpoint, data) => apiCall(endpoint, {
    method: 'PUT', 
    body: JSON.stringify(data)
  })
  
  const patch = (endpoint, data) => apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
  
  const del = (endpoint) => apiCall(endpoint, { 
    method: 'DELETE' 
  })

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del
  }
}