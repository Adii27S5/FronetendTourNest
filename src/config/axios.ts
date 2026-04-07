import axios from 'axios';
import { API_BASE_URL } from './api';
import { toast } from 'sonner';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 120000 // 120 seconds timeout for requests
});

// Response interceptor for generic error handling globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Only trigger toast for strict failures to avoid spam
        if (error.response) {
            if (error.response.status >= 500) {
                toast.error("Server is currently stabilizing. Please try again.");
                console.error("Backend Error:", error.response.data);
            }
            if (error.response.status === 401) {
                // If token logic is added later
            }
        } else if (error.request) {
            toast.error("Network issue. Our data sources might be sleeping.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;
