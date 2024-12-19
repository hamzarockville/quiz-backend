import { IsString, IsArray, ArrayMinSize, ValidateNested, IsInt, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @IsInt()
  correctAnswer: number;
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