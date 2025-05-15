import config from './config';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithRetry = async (url, options = {}, retryCount = 0) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }

        if (retryCount < config.api.retryAttempts) {
            await sleep(config.api.retryDelay * (retryCount + 1));
            return fetchWithRetry(url, options, retryCount + 1);
        }

        throw error;
    }
};

export const handleApiError = (error) => {
    if (error.name === 'AbortError') {
        return {
            message: 'Request timed out. Please try again.',
            type: 'timeout'
        };
    }

    if (error.message.includes('Failed to fetch')) {
        return {
            message: 'Unable to connect to the server. Please check your internet connection.',
            type: 'network'
        };
    }

    return {
        message: error.message || 'An unexpected error occurred.',
        type: 'error'
    };
}; 