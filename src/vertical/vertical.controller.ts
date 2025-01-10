import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { VerticalService } from './vertical.service';
import { CreateVerticalDto } from './dto/create-vertical.dto';

@Controller('vertical')
export class VerticalController {
    constructor(private readonly verticalsService: VerticalService) {}

    @Get()
    async findAll() {
      return this.verticalsService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.verticalsService.findOne(id);
    }
  
    @Post()
    async create(@Body() createVerticalDto: CreateVerticalDto) {
      return this.verticalsService.create(createVerticalDto);
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateVerticalDto: CreateVerticalDto) {
      return this.verticalsService.update(id, updateVerticalDto);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.verticalsService.delete(id);
    }
  }