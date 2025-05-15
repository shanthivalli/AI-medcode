const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
        retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3', 10),
        retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000', 10),
    }
};

export default config; 