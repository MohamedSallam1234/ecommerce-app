import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);
  await app.listen(3003);
}
bootstrap().then(() => {
  console.log('Product service started');
});
