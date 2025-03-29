import axios from "axios" // Import axios to use its types/helpers like isAxiosError
import { type Banca } from "../routes/_index" // Ensure Banca interface is accessible
import apiClient from "./apiClient" // Import the configured axios instance

// No longer need API_BASE_URL here as it's configured in apiClient

interface ApiResponse {
  data: Banca[]
  // Add other potential properties of the API response if known
}

/**
 * Fetches the list of bancas from the production API using axios.
 * @returns {Promise<Banca[]>} A promise that resolves to an array of Banca objects.
 * @throws {Error} Throws an error if the network request fails or the API returns an error status.
 */
export const fetchBancas = async (): Promise<Banca[]> => {
  const url = `/api/banca` // Use relative path, base URL is handled by apiClient

  try {
    const response = await apiClient.get<ApiResponse>(url) // Use apiClient.get

    // Axios nests the response data under the 'data' property
    // Assuming the actual bancas array is nested further under response.data.data
    return response.data?.data || []
  } catch (error) {
    console.error("Failed to fetch bancas:", error)

    // Axios error handling: check if it's an Axios error to get more details
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || error.message || "An unknown error occurred while fetching bancas."
      throw new Error(errorMessage)
    } else {
      // Handle non-Axios errors (e.g., network issues before request is sent)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.")
    }
  }
}
