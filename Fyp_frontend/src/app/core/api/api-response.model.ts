/**
 * Standard ApiResponse envelope for Node.js REST API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}
