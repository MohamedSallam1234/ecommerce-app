import { NestFactory } from '@nestjs/core';
import { HomeModule } from './home.module';

async function bootstrap() {
  const app = await NestFactory.create(HomeModule);
  await app.listen(3002);
}
bootstrap().then(() => {
  console.log('Home service started');
});
