import 'dotenv/config';
import 'express-async-errors';

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './modules/auth/auth.router';
import transactionsRouter from './modules/transactions';
import banksRouter from './modules/banks';
import chequesRouter from './modules/cheques';
import creditCardsRouter from './modules/creditCards';
import loansRouter from './modules/loans';
import reportsRouter from './modules/reports';
import dashboardRouter from './modules/dashboard';
import customersRouter from './modules/customers';
import suppliersRouter from './modules/suppliers';
import posTerminalsRouter from './modules/pos-terminals';
import adminRouter from './modules/admin/admin.router';
import auditLogRouter from './modules/auditLog/auditLog.router';

import { prisma } from './config/prisma';
import { seedUsers } from './config/seedUsers';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

app.get('/health', async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/banks', banksRouter);
app.use('/api/cheques', chequesRouter);
app.use('/api/credit-cards', creditCardsRouter);
app.use('/api/loans', loansRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/pos-terminals', posTerminalsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/audit-logs', auditLogRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT ?? 4000);

async function bootstrap() {
  // 1) env sanity
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.error('❌ DATABASE_URL is missing. Check server/.env');
    process.exit(1);
  }

  // 2) DB connect check
  try {
    await prisma.$connect();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('❌ Database connection failed. Check DATABASE_URL credentials/host/port.', e);
    process.exit(1);
  }

  // 3) seed users (should exist for login)
  try {
    await seedUsers(prisma);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to seed users:', e);
    process.exit(1);
  }

  // 4) start server
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`ESCA FOOD WEB KASA backend listening on port ${port}`);
  });
}

bootstrap();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
