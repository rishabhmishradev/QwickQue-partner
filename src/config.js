// For Local: http://localhost:3005/api/v1
// For Production (After SSL): https://3.111.59.7.sslip.io/api/v1
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3005/api/v1'
  : 'https://3.111.59.7.sslip.io/api/v1';
