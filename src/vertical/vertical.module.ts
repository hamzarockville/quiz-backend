import { Module } from '@nestjs/common';
import { VerticalController } from './vertical.controller';
import { VerticalService } from './vertical.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VerticalSchema } from './schemas/vertical.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Vertical', schema: VerticalSchema }])],
  controllers: [VerticalController],
  providers: [VerticalService]
})
export class VerticalModule {}
