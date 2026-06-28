import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function startServer(): Promise<void> {
  try {
    // ─── Connect to MongoDB ──────────────────────────────
    await connectDB();

    // ─── Start Express Server ────────────────────────────
    const server = app.listen(env.port, () => {
      const mode = env.nodeEnv.toUpperCase();
      console.log(`
╔══════════════════════════════════════════╗
║           FastFeast API Server           ║
╠══════════════════════════════════════════╣
║  Mode:      ${mode.padEnd(33)}║
║  Port:      ${String(env.port).padEnd(33)}║
║  Database:  ${'MongoDB'.padEnd(33)}║
║  CORS:      ${env.corsOrigin.padEnd(33)}║
╚══════════════════════════════════════════╝
      `);
    });

    // ─── Graceful Shutdown ───────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // ─── Unhandled Rejections ────────────────────────────
    process.on('unhandledRejection', (reason: Error) => {
      console.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
