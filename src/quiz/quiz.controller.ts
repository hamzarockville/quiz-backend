import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto, SaveQuizDto, SubmitQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
    return this.quizService.generateQuiz(generateQuizDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  saveQuiz(@Body() saveQuizDto: SaveQuizDto, @Request() req) {
    return this.quizService.saveQuiz(saveQuizDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.quizService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get('share/:link')
  findByShareableLink(@Param('link') link: string) {
    return this.quizService.findByShareableLink(link);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitQuiz(@Body() submitQuizDto: SubmitQuizDto, @Request() req) {
    return this.quizService.submitQuiz(submitQuizDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('results/user/:userId')
  async getResultsByUserId(@Param('userId') userId: string) {
    return this.quizService.getResultsByUserId(userId);
  }
  @UseGuards(JwtAuthGuard)
@Get('results/result/:resultId')
async getResultById(@Param('resultId') resultId: string) {
  return this.quizService.getResultById(resultId);
}
}
