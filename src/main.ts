import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Blog App Phase 3')
    .setDescription('Blog app API documentation')
    .setVersion('1.0')
    .addTag('Blogs')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => console.error(err));
