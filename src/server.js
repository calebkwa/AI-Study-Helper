require('dotenv').config(); 
const { createApp } = require('./app');
console.log("ENV TEST:", process.env.GEMINI_API_KEY);

const PORT = Number.parseInt(process.env.PORT ?? '', 10) || 3000;
const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;