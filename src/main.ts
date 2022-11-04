import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require("dotenv").config({ path: `../env.${process.env.NODE_ENV}` });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
