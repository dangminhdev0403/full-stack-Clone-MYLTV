import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getBackendEnvConfig } from './config/env.config';

async function bootstrap() {
  const config = getBackendEnvConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
}
bootstrap();
