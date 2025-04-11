const config = {
    gateway: {
        port: process.env.GATEWAY_PORT || 3000,
        jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
        debug: process.env.DEBUG === 'true'
    },
    services: {
        auth: {
            url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
            circuitBreaker: {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'auth-service'
            }
        },
        target: {
            url: process.env.TARGET_SERVICE_URL || 'http://target-service:3002',
            circuitBreaker: {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'target-service'
            }
        }
    }
}

module.exports = config;