import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

import { RatingType } from '../../../enums/rating-type.enum';

export class CreateRatingDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @IsIn([RatingType.POSITIVE, RatingType.NEGATIVE])
  ratingType: number;

  @Type(() => String)
  @IsOptional()
  @MaxLength(2000)
  comment: string;
}