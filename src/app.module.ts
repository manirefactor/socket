import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { codeModule } from './modules/codeModule/code.module';
require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });
console.log(`ENV: `,process.env.NODE_ENV);
@Module({
  imports: [
    MongooseModule.forRoot("mongodb+srv://trakinvest:RM5b8oO7my1xJYnW@cluster0.pegrn.mongodb.net/?retryWrites=true&w=majority"),
    codeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
