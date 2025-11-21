import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import connectPgSimple from 'connect-pg-simple';

const PostgresSessionStore = connectPgSimple(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(
    session({
      store: new PostgresSessionStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
        tableName: 'session',
        pruneSessionInterval: 60 * 15,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 WFM24/7 Server running on http://0.0.0.0:${port}`);
}
bootstrap();
