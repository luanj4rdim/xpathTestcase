const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://automationexercise.com',
    specPattern: 'spec.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
  },
});