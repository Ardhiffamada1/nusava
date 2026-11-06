import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const storefrontOrigin = process.env.FRONTEND_STOREFRONT_URL || 'http://localhost:3000';
  const adminOrigin = process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001';

  app.enableCors({
    origin: [storefrontOrigin, adminOrigin, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`CommerceOS API server successfully started on http://localhost:${port}/api/v1`);
}

bootstrap();
