import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  await app.register(fastifyCookie);
  const PORT = process.env.PORT;
  const HOST = process.env.HOST;
  await app.listen(PORT, HOST, () =>
    console.log(`App successfully running on http://${HOST}:` + PORT + '...'),
  );
}
bootstrap();
