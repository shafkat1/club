import axios from 'axios'

// Backend API configuration
const API_BASE_URL = 'http://localhost:3000/api'

export interface Venue {
  id: string
  name: string
  type: 'restaurant' | 'bar' | 'nightclub' | 'cafe' | 'pub' | 'brewery' | 'lounge' | 'mixed'
  address: string
  latitude: number
  longitude: number
  rating?: number
  reviewCount?: number
  distance?: number
  openNow?: boolean
  phone?: string
  website?: string
  photos?: string[]
}

/**
 * Google Places API Integration via Backend Proxy
 * 
 * All calls are routed through the NestJS backend to:
 * 1. Bypass CORS restrictions
 * 2. Keep API key secure (not exposed in frontend)
 * 3. Enable caching and optimization
 * 4. Add authentication if needed
 */
export const googlePlacesAPI = {
  /**
   * Fetch nearby venues of a specific type
   * @param latitude - User's latitude
   * @param longitude - User's longitude
   * @param type - Venue type: restaurant, bar, night_club, cafe, etc.
   * @param radius - Search radius in meters (default: 8047 = 5 miles)
   */
  getNearbyVenues: async (
    latitude: number,
    longitude: number,
    type: string = 'restaurant',
    radius: number = 8047
  ): Promise<Venue[]> => {
    try {
      console.log(`Fetching ${type} venues near ${latitude}, ${longitude}...`)
      
      const response = await axios.get(`${API_BASE_URL}/venues/nearby`, {
        params: {
          latitude,
          longitude,
          type,
          radius,
        },
      })

      console.log(`Successfully fetched ${response.data.length} ${type} venues`)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${type} venues:`, error)
      return []
    }
  },

  /**
   * Search venues by query
   * @param query - Search query (e.g., "pizza", "cocktails")
   * @param latitude - Center latitude
   * @param longitude - Center longitude
   * @param radius - Search radius in meters
   */
  searchVenues: async (
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 8047
  ): Promise<Venue[]> => {
    try {
      console.log(`Searching for "${query}" near ${latitude}, ${longitude}...`)
      
      const response = await axios.get(`${API_BASE_URL}/venues/search-places`, {
        params: {
          query,
          latitude,
          longitude,
          radius,
        },
      })

      console.log(`Found ${response.data.length} results for "${query}"`)
      return response.data
    } catch (error) {
      console.error(`Error searching venues:`, error)
      return []
    }
  },

  /**
   * Get details for a specific venue
   * @param venueId - Venue ID (place_id from Google Places)
   */
  getVenueDetails: async (venueId: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venues/${venueId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching venue details:', error)
      return null
    }
  },
}
