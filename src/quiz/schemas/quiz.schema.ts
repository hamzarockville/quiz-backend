import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
class Question extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correctAnswer: number;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  jobArea: string;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  shareableLink: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);


@Schema()
class Answer extends Document {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  answer: string;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema()
export class Result extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [AnswerSchema], required: true })
  answers: Answer[];

  @Prop({ required: true })
  score: number;

  @Prop({ default: Date.now })
  attemptedAt: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);