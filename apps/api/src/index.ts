import app from './app';
import { verifyTransporter } from './services/mailService';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await verifyTransporter();
  app.listen(PORT, () => {
    console.log(`⚡️[server]: StudyOS API is running at http://localhost:${PORT}`);
  });
};

startServer();

