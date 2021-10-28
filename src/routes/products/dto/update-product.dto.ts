import { Type } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';

export class UpdateProductDto {
  @Type(() => String)
  @IsNotEmpty()
  @Length(10, 10000)
  description: string;
}