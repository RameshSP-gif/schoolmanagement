const app = require('../server/server');

// Log incoming requests in production
if (process.env.NODE_ENV === 'production') {
  const originalListen = app.listen;
  app.listen = function() {
    console.log('API handler loaded on Vercel');
    return originalListen.apply(this, arguments);
  };
}

module.exports = app;
