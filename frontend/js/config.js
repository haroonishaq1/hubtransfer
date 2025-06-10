// Configuration for different environments
window.AppConfig = {
    // Auto-detect environment based on hostname
    getApiUrl: function() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
          // Production (Render deployment)
        if (hostname.includes('onrender.com')) {
            // If we're on the frontend URL, point to backend URL
            if (hostname.includes('hubtransfer-frontend')) {
                return 'https://hubtransfer.onrender.com';
            }
            // If we're on the backend URL, use same URL
            if (hostname.includes('hubtransfer')) {
                return `${protocol}//${hostname}`;
            }
            // Default backend URL for Render
            return 'https://hubtransfer.onrender.com';
        }
        
        // Development - localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const port = window.location.port;
            // If frontend is on port 8000, backend is on 4999
            if (port === '8000') {
                return 'http://localhost:4999';
            }
            // If on same port or default, use 4999
            return 'http://localhost:4999';
        }
        
        // Default fallback
        return 'http://localhost:4999';
    },
    
    // Get WebSocket URL
    getSocketUrl: function() {
        const apiUrl = this.getApiUrl();
        return apiUrl.replace('http', 'ws').replace('https', 'wss');
    },
    
    // Check if we're in production
    isProduction: function() {
        return window.location.hostname.includes('onrender.com');
    }
};
