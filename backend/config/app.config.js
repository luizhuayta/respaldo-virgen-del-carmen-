/**
 * Application Configuration
 * This file exports application-wide configuration variables
 */

const getAppConfig = () => {
  return {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    // Add other app-wide config here as needed
  };
};

module.exports = getAppConfig;