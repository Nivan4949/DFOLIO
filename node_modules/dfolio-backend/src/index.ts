import dotenv from 'dotenv';
// Load environment variables before importing app
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Construction Execution Management API running on port ${PORT}`);
});
