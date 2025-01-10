import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVerticalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
