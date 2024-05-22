import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    origin: '*', // specify the server origin
    methods: '*',
    allowedHeaders: '*',
    credentials: true, // enable credentials
  });
  await app.listen(3000);
}
bootstrap().then(() => {
  console.log('Authentication service started');
});
