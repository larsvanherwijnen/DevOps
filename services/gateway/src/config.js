const config = {
    gateway: {
        port: process.env.GATEWAY_PORT || 3000,
        debug: process.env.DEBUG === 'true'
    },
    services: {
        auth: {
            url: process.env.SERVICE_A_URL || 'http://service-a:3001',
            circuitBreaker: {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'service-a'
            }
        },
        target: {
            url: process.env.SERVICE_B_URL || 'http://service-b:3002',
            circuitBreaker: {
                timeout: 5000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                name: 'service-b'
            }
        }
    }
}

module.exports = config;