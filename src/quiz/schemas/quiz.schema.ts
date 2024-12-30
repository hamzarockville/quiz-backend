import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
class Question extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], default: [] }) // Options are only applicable for MCQs
  options: string[];

  @Prop({ type: MongooseSchema.Types.Mixed, required: true }) // Explicitly define the type for correctAnswer
  correctAnswer: string | number;


  @Prop({ required: true, enum: ['mcq', 'q&a'] }) // Add type field to distinguish question type
  type: string;
}
const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  jobArea: string;

  @Prop({ type: [QuestionSchema], required: true }) // Updated to support mixed question types
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

  @Prop({ required: true, type: String }) // Explicitly define the type as String
  selectedAnswer: string;

  @Prop({ required: false, type: Boolean }) // Add optional field for correctness
  isCorrect?: boolean;
}

const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema()
export class Result extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [AnswerSchema], required: true })
  answers: Answer[]; // Save detailed answers with correctAnswer and isCorrect

  @Prop({ required: true })
  score: number;

  @Prop({ default: Date.now })
  attemptedAt: Date;
}
export const ResultSchema = SchemaFactory.createForClass(Result);