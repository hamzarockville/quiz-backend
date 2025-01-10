import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vertical } from './schemas/vertical.schema';
import { CreateVerticalDto } from './dto/create-vertical.dto';
@Injectable()
export class VerticalService {
    constructor(@InjectModel('Vertical') private readonly verticalModel: Model<Vertical>) {}

    async findAll(): Promise<Vertical[]> {
      return this.verticalModel.find().exec();
    }
  
    async findOne(id: string): Promise<Vertical> {
      const vertical = await this.verticalModel.findById(id).exec();
      if (!vertical) {
        throw new NotFoundException(`Vertical with ID "${id}" not found.`);
      }
      return vertical;
    }
  
    async create(createVerticalDto: CreateVerticalDto): Promise<Vertical> {
      const newVertical = new this.verticalModel(createVerticalDto);
      return newVertical.save();
    }
  
    async update(id: string, updateVerticalDto: CreateVerticalDto): Promise<Vertical> {
      const updatedVertical = await this.verticalModel.findByIdAndUpdate(id, updateVerticalDto, { new: true }).exec();
      if (!updatedVertical) {
        throw new NotFoundException(`Vertical with ID "${id}" not found.`);
      }
      return updatedVertical;
    }
  
    async delete(id: string): Promise<{ message: string }> {
        const result = await this.verticalModel.findByIdAndDelete(id).exec();
        if (!result) {
          throw new NotFoundException(`Vertical with ID "${id}" not found.`);
        }
        return { message: 'Vertical deleted successfully' };
      }
      
  }