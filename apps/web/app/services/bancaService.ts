import { TODO } from "@/lib/utils"
import { type Banca } from "../routes/_index" // Assuming Banca interface is exported or accessible

// Use environment variable for the API base URL.
// Ensure REACT_APP_API_BASE_URL is set in your .env file (e.g., REACT_APP_API_BASE_URL=https://your-production.com)
// Note: For React apps created with Create React App or similar setups, env vars need to start with REACT_APP_
// Adjust if your build tool uses a different prefix (e.g., VITE_ for Vite).

TODO("Remove this")
const API_BASE_URL = "https://sistema-de-defesas-api.app.ic.ufba.br"

if (!API_BASE_URL) {
  console.warn("REACT_APP_API_BASE_URL environment variable is not set. API calls might fail.")
}

interface ApiResponse {
  data: Banca[]
  // Add other potential properties of the API response if known
}

/**
 * Fetches the list of bancas from the production API.
 * @returns {Promise<Banca[]>} A promise that resolves to an array of Banca objects.
 * @throws {Error} Throws an error if the network request fails or the API returns an error status.
 */
export const fetchBancas = async (): Promise<Banca[]> => {
  const url = `${API_BASE_URL}/banca` // Construct the full URL

  try {
    const response = await fetch(url)

    if (!response.ok) {
      // Attempt to get error details from response body if possible
      let errorDetails = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorDetails += `, message: ${JSON.stringify(errorData)}`
      } catch (jsonError) {
        // Ignore if response body is not valid JSON
      }
      throw new Error(errorDetails)
    }

    const apiResponse: ApiResponse = await response.json()

    // Assuming the actual data is nested under a 'data' key
    return apiResponse.data || []
  } catch (error) {
    console.error("Failed to fetch bancas:", error)
    // Re-throw the error so the component's catch block can handle it
    throw error
  }
}
