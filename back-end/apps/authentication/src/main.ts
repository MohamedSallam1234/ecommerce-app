// import { NestFactory } from '@nestjs/core';
// import { AuthenticationModule } from './authentication.module';
// import { ValidationPipe } from '@nestjs/common';
//
// async function bootstrap() {
//   const app = await NestFactory.create(AuthenticationModule);
//   app.useGlobalPipes(new ValidationPipe());
//   await app.listen(3001);
// }
// bootstrap().then(() => {
//   console.log('Authentication service started');
// });

import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);
  app.useGlobalPipes(new ValidationPipe());
  //app.useGlobalGuards(new AuthenticationGuard());
  await app.listen(3000);
}
bootstrap().then(() => {
  console.log('Authentication service started');
});
