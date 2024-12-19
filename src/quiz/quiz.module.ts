import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema, Result, ResultSchema } from './schemas/quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: Result.name, schema: ResultSchema }, // Register Result schema here
    ]),
  ],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}

