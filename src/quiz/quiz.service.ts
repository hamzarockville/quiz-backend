import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, Result } from './schemas/quiz.schema';
import { GenerateQuizDto, SaveQuizDto, SubmitQuizDto } from './dto/create-quiz.dto';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

@Injectable()
export class QuizService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
  ) {
    this.openai = new OpenAI({
      apiKey: '5NoRjFHzVBsqIZw6Fl_cNFLmhtvE5qHQ3qJ2aj40zRtLWJNvPbJ3Y4mv4mSTFB8AE6ZwTHU79RT3BlbkFJecmfZriEx7f4iVvLrV_A_gYpkGQLkxFPGpf9VBcLoQmaOMLEz4ZLMWWFSlfNjWQgwcxLmlIYwA',
    });
  }

  async generateQuiz(generateQuizDto: GenerateQuizDto): Promise<any> {
    const { jobDescription, numQuestions } = generateQuizDto;
  
    try {
      // Updated prompt for technical questions in valid JSON array format
      const prompt = `
        Generate ${numQuestions} technical multiple-choice questions based on the following job description:
        "${jobDescription}".
        Ensure all questions are related to the required technical skills, tools, and technologies mentioned in the description.
        Format the response as a JSON array where each object contains:
        - "id": question number
        - "text": question text
        - "options": array of 4 options
        - "correctAnswer": index (1-based) of the correct option
        Example:
        [
          {
            "id": 1,
            "text": "What is JavaScript?",
            "options": ["A programming language", "A database", "An operating system", "A cloud platform"],
            "correctAnswer": 1
          },
          ...
        ]
      `;
  
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
  
      // Extract and parse the JSON array
      const rawContent = response.choices[0]?.message?.content || '[]';
      console.log('Raw OpenAI Response:', rawContent);
  
      // Ensure parsing works correctly
      const questions = JSON.parse(rawContent);
  
      // Validate response structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format received from OpenAI.');
      }
  
      return { questions };
    } catch (error) {
      console.error('Error generating quiz:', error.message);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }
  
  
  async saveQuiz(saveQuizDto: SaveQuizDto, userId: string): Promise<Quiz> {
    const shareableLink = uuidv4();
    const quiz = new this.quizModel({
      ...saveQuizDto,
      createdBy: userId,
      shareableLink,
    });

    return quiz.save();
  }

  async findAll(userId: string): Promise<Quiz[]> {
    return this.quizModel.find({ createdBy: userId }).exec();
  }

  async findOne(id: string): Promise<Quiz> {
    return this.quizModel.findById(id).exec();
  }

  async findByShareableLink(shareableLink: string): Promise<Quiz> {
    return this.quizModel.findOne({ shareableLink }).exec();
  }
  async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string): Promise<any> {
    console.log('req ', submitQuizDto)
    const { quizId, answers } = submitQuizDto;
    const quiz = await this.quizModel.findById(quizId);

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    let score = 0;
    answers.forEach((answer) => {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
      if (question && question.correctAnswer.toString() === answer.answer) {
        score++;
      }
    });

    const result = new this.resultModel({
      quizId,
      userId,
      answers,
      score,
    });

    await result.save();

    return {
      message: 'Quiz submitted successfully',
      score,
      totalQuestions: quiz.questions.length,
    };
  }

  async getResultsByUserId(userId: string): Promise<Result[]> {
    const results = await this.resultModel.find({ userId }).populate('quizId', 'title').exec();

    if (!results || results.length === 0) {
      throw new NotFoundException('No results found for this user');
    }

    return results;
  }
  async getResults(quizId: string, userId: string): Promise<any> {
    // Find the result by quizId and userId
    console.log('quizId', quizId, 'userId', userId)
    const result = await this.resultModel.findOne({ quizId, userId }).exec();
  console.log('result', result)
    if (!result) {
      throw new NotFoundException('Result not found for this quiz and user');
    }
  
    // Populate the quiz and questions
    const quiz = await this.quizModel.findById(quizId).exec();
  
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
  
    // Format the response to include question, options, selected answer, and correct answer
    const detailedResults = quiz.questions.map((question: any) => {
      const submittedAnswer = result.answers.find((a) => a.questionId === question._id.toString());
  
      return {
        question: question.text,
        options: question.options,
        selectedAnswer: submittedAnswer ? submittedAnswer.answer : null,
        isCorrect: submittedAnswer ? question.correctAnswer.toString() === submittedAnswer.answer : false,
        correctAnswer: question.options[question.correctAnswer], // Assuming `correctAnswer` is the index of the correct option
      };
    });
  
    return {
      quizTitle: quiz.title,
      totalScore: result.score,
      detailedResults,
    };
  }
  async getResultById(resultId: string): Promise<any> {
    // Find the result by result ID and populate the quiz
    const result = await this.resultModel.findById(resultId).populate('quizId').exec();
  
    if (!result) {
      throw new NotFoundException('Result not found');
    }
  
    // Cast the populated quizId as a Quiz document
    const quiz = result.quizId as unknown as Quiz;
  
    // Safely access the quiz questions
    const detailedResults = quiz.questions.map((question: any) => {
      const submittedAnswer = result.answers.find((a) => a.questionId === question._id.toString());
  
      return {
        question: question.text,
        options: question.options,
        selectedAnswer: submittedAnswer
          ? question.options[parseInt(submittedAnswer.answer)] // Map selected index to option
          : 'Not answered',
        isCorrect: submittedAnswer
          ? question.correctAnswer.toString() === submittedAnswer.answer
          : false,
        correctAnswer: question.options[question.correctAnswer],
      };
    });
  
    return {
      quizTitle: quiz.title,
      totalScore: result.score,
      detailedResults,
    };
  }
}
