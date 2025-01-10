import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, Result } from './schemas/quiz.schema';
import { GenerateQuizDto, SaveQuizDto, SubmitQuizDto } from './dto/create-quiz.dto';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class QuizService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
  ) {
    this.openai = new OpenAI({
      apiKey: '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',
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
  
  async generateQnaQuiz(generateQuizDto: GenerateQuizDto): Promise<any> {
    const { jobDescription, numQuestions } = generateQuizDto;
  
    try {
      // Updated prompt for open-ended Q&A questions with answers
      const prompt = `
        Generate ${numQuestions} open-ended questions based on the following job description:
        "${jobDescription}".
        Ensure all questions are related to the required skills, tools, and responsibilities mentioned in the description.
        For each question, provide:
        - "id": question number
        - "text": question text
        - "correctAnswer": the ideal answer to the question
        Format the response as a JSON array.
        Example:
        [
          {
            "id": 1,
            "text": "Explain the process of setting up a CI/CD pipeline.",
            "correctAnswer": "The process involves setting up source control, defining build automation, configuring testing frameworks, and deploying using tools like Jenkins or GitHub Actions."
          },
          {
            "id": 2,
            "text": "Describe the key responsibilities of a project manager in Agile methodology.",
            "correctAnswer": "The responsibilities include facilitating daily standups, ensuring team alignment, removing blockers, and prioritizing tasks based on stakeholder feedback."
          }
        ]
      `;
  
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });
  
      // Extract and parse the JSON array
      const rawContent = response.choices[0]?.message?.content || '[]';
      console.log('Raw OpenAI Response for Q&A with Answers:', rawContent);
  
      // Ensure parsing works correctly
      const questions = JSON.parse(rawContent);
  
      // Validate response structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid Q&A questions format received from OpenAI.');
      }
  
      return { questions };
    } catch (error) {
      console.error('Error generating Q&A quiz:', error.message);
      throw new Error('Failed to generate Q&A quiz. Please try again.');
    }
  }
  
  // async saveQuiz(saveQuizDto: SaveQuizDto, userId: string): Promise<Quiz> {
  //   const shareableLink = uuidv4();
  //   const quiz = new this.quizModel({
  //     ...saveQuizDto,
  //     createdBy: userId,
  //     shareableLink,
  //   });

  //   return quiz.save();
  // }
  async saveQuiz(saveQuizDto: SaveQuizDto, userId: string): Promise<Quiz> {
    const shareableLink = uuidv4();
    const questions = saveQuizDto.questions.map((question) => {
      if (question.type === 'mcq' && (!question.options || question.options.length < 2)) {
        throw new Error('MCQ questions must have at least 2 options.');
      }
  
      return {
        ...question,
        correctAnswer: question.type === 'mcq' ? Number(question.correctAnswer) : question.correctAnswer,
      };
    });
  
    const quiz = new this.quizModel({
      ...saveQuizDto,
      questions,
      createdBy: userId,
      shareableLink,
    });
  
    return quiz.save();
  }
  
  async findAll(userId: string): Promise<Quiz[]> {
    return this.quizModel.find({ createdBy: userId }).exec();
  }
  async findAllPublic(): Promise<Quiz[]> {
    // return this.quizModel.find().exec();
    return this.quizModel.aggregate([
      {
        $addFields: {
          createdByObjectId: { $toObjectId: '$createdBy' }, // Convert `createdBy` to ObjectId
        },
      },
      {
        $lookup: {
          from: 'users', // Collection name of the User model
          localField: 'createdByObjectId', // Use the converted ObjectId field
          foreignField: '_id', // Field in the User collection
          as: 'userDetails', // Resulting field
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true, // Keeps quizzes without users
        },
      },
      {
        $addFields: {
          createdByName: '$userDetails.name', // Add user's name to the response
        },
      },
      {
        $project: {
          userDetails: 0, // Remove the userDetails field
          createdByObjectId: 0, // Remove the temporary ObjectId field
        },
      },
    ]);
  }

  async findOne(id: string): Promise<Quiz> {
    return this.quizModel.findById(id).exec();
  }

  async findByShareableLink(shareableLink: string): Promise<Quiz> {
    return this.quizModel.findOne({ shareableLink }).exec();
  }
  // async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string): Promise<any> {
  //   console.log('req ', submitQuizDto)
  //   const { quizId, answers } = submitQuizDto;
  //   const quiz = await this.quizModel.findById(quizId);

  //   if (!quiz) {
  //     throw new NotFoundException('Quiz not found');
  //   }

  //   let score = 0;
  //   answers.forEach((answer) => {
  //     const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
  //     if (question && question.correctAnswer.toString() === answer.answer) {
  //       score++;
  //     }
  //   });

  //   const result = new this.resultModel({
  //     quizId,
  //     userId,
  //     answers,
  //     score,
  //   });

  //   await result.save();

  //   return {
  //     message: 'Quiz submitted successfully',
  //     score,
  //     totalQuestions: quiz.questions.length,
  //   };
  // }
  // async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string): Promise<any> {
  //   console.log('req ', submitQuizDto);
  //   const { quizId, answers } = submitQuizDto;
  
  //   const quiz = await this.quizModel.findById(quizId);
  
  //   if (!quiz) {
  //     throw new NotFoundException('Quiz not found');
  //   }
  
  //   let score = 0;
  
  //   // Process each answer
  //   const processedAnswers = answers.map((answer) => {
  //     const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
    
  //     if (question) {
  //       const isCorrect = question.correctAnswer.toString() === answer.answer;
    
  //       if (isCorrect) {
  //         score++;
  //       }
    
  //       return {
  //         questionId: answer.questionId,
  //         selectedAnswer: answer.answer,
  //         correctAnswer: question.correctAnswer, // Include correct answer
  //         isCorrect,
  //       };
  //     }
    
  //     return {
  //       questionId: answer.questionId,
  //       selectedAnswer: answer.answer,
  //       correctAnswer: null, // If the question is not found, correct answer is null
  //       isCorrect: false,
  //     };
  //   });
  
  //   // Save the result
  //   const result = new this.resultModel({
  //     quizId,
  //     userId,
  //     answers: processedAnswers, // Save detailed answers
  //     score,
  //   });
  // console.log('result', result)
  //   await result.save();
  
  //   return {
  //     message: 'Quiz submitted successfully',
  //     score,
  //     totalQuestions: quiz.questions.length,
  //   };
  // }
  async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string): Promise<any> {
    console.log('Incoming request body:', JSON.stringify(submitQuizDto, null, 2));
    
    const { quizId, answers } = submitQuizDto;
    const quiz = await this.quizModel.findById(quizId);
  
    if (!quiz) {
      console.error('Quiz not found for ID:', quizId);
      throw new NotFoundException('Quiz not found');
    }
  
    console.log('Quiz questions:', JSON.stringify(quiz.questions, null, 2));
  
    let score = 0;
  
    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
  
      if (!question) {
        console.warn(`Question not found for ID: ${answer.questionId}`);
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.answer,
          isCorrect: false,
        };
      }
  
      const isCorrect =
        question.correctAnswer === question.options.indexOf(answer.answer) ||
        question.correctAnswer.toString() === answer.answer;
  
      if (isCorrect) {
        score++;
      }
  
      console.log(
        `Processing question: ${question.text}\nCorrect Answer: ${
          question.options[question.correctAnswer]
        }\nSubmitted Answer: ${answer.answer}\nIs Correct: ${isCorrect}`
      );
  
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.answer,
        isCorrect,
      };
    });
  
    console.log('Processed answers:', JSON.stringify(processedAnswers, null, 2));
    console.log('Final calculated score:', score);
  
    const result = new this.resultModel({
      quizId,
      userId,
      answers: processedAnswers,
      score,
    });
  
    await result.save();
  
    console.log('Result saved successfully:', JSON.stringify(result, null, 2));
  
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
    const result = await this.resultModel.findOne({ quizId, userId }).exec();
  
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
      const submittedAnswer = result.answers.find(
        (a) => a.questionId === question._id.toString()
      );
  
      return {
        question: question.text,
        options: question.options || [], // Options might not exist for Q&A
        selectedAnswer: submittedAnswer ? submittedAnswer.selectedAnswer : null,
        isCorrect: submittedAnswer ? submittedAnswer.isCorrect : false,
        correctAnswer: question.type === 'mcq' 
          ? question.options[question.correctAnswer] // Correct option text for MCQ
          : question.correctAnswer, // Correct answer text for Q&A
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
  
    // Format the response to include question, options, selected answer, and correct answer
    const detailedResults = quiz.questions.map((question: any) => {
      const submittedAnswer = result.answers.find(
        (a) => a.questionId === question._id.toString()
      );
  
      return {
        question: question.text,
        options: question.options || [], // Options might not exist for Q&A
        selectedAnswer: submittedAnswer ? submittedAnswer.selectedAnswer : 'Not answered',
        isCorrect: submittedAnswer ? submittedAnswer.isCorrect : false,
        correctAnswer: question.type === 'mcq'
          ? question.options[question.correctAnswer] // Correct option text for MCQ
          : question.correctAnswer, // Correct answer text for Q&A
      };
    });
  
    return {
      quizTitle: quiz.title,
      totalScore: result.score,
      detailedResults,
    };
  }
  }
