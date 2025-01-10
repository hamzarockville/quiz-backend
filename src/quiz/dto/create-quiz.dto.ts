import { IsString, IsArray, ArrayMinSize, ValidateNested, IsInt, Min, IsMongoId, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsOptional()
  @ValidateIf((question) => question.type === 'mcq')
  options?: string[];

  @IsInt()
  @IsOptional()
  @ValidateIf((question) => question.type === 'mcq')
  correctAnswer: string | number;

  @IsString()
  @IsOptional()
  @ValidateIf((question) => question.type === 'q&a')
  correctAnswerText?: string;

  @IsString()
  type: 'mcq' | 'q&a'; // New field to distinguish question type
}


export class GenerateQuizDto {
  @IsString()
  jobDescription: string;

  @IsInt()
  @Min(1)
  numQuestions: number;
}

export class SaveQuizDto {
  @IsString()
  title: string;

  @IsString()
  jobArea: string;
  @IsString()
  vertical: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string; // Assume the answer is the option text or index
}

export class SubmitQuizDto {
  @IsMongoId()
  quizId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}