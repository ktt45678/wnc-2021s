import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class ApproveBidDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  user: number;

  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  @IsNotEmpty()
  @IsBoolean()
  accept: boolean;
}