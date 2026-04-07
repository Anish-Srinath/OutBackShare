import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

/**
 * Send image to AI recognition service
 * @param {FormData} imageFormData - Form data containing the image file
 * @returns {Promise<Object>} - foodType, quantity, confidence, etc.
 */
export const recognizeFoodFromImage = async (imageFormData) => {
  try {
    const response = await apiClient.post('/image-recognition/recognize', imageFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Image recognition error:', error)
    throw error
  }
}

/**
 * Submit a food listing
 * @param {Object} listingData - Listing information
 * @returns {Promise<Object>} - Created listing data
 */
export const submitListing = async (listingData) => {
  try {
    const response = await apiClient.post('/listings', listingData)
    return response.data
  } catch (error) {
    console.error('Submit listing error:', error)
    throw error
  }
}

/**
 * Get available listings (for organization view)
 * @param {Object} filters - Filter parameters (postcode, foodType, etc.)
 * @returns {Promise<Array>} - Array of listings
 */
export const getAvailableListings = async (filters = {}) => {
  try {
    const response = await apiClient.get('/listings', {
      params: filters,
    })
    return response.data
  } catch (error) {
    console.error('Get listings error:', error)
    throw error
  }
}

/**
 * Claim a listing
 * @param {string} listingId - ID of the listing to claim
 * @param {Object} claimData - Claim information (org_id, etc.)
 * @returns {Promise<Object>} - Claim confirmation
 */
export const claimListing = async (listingId, claimData) => {
  try {
    const response = await apiClient.post(`/listings/${listingId}/claim`, claimData)
    return response.data
  } catch (error) {
    console.error('Claim listing error:', error)
    throw error
  }
}

export default apiClient
