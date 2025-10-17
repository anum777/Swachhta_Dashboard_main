export const API_BASE_URL = 'http://localhost:5000';

export const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
    },
    mode: 'cors',
    credentials: 'omit',
    keepalive: true,
    cache: 'no-cache'
};

export const fetchConfig = {
    timeout: 60000,
    maxRetries: 3,
    retryDelay: 2000,
    compress: true
};
