import { Type } from 'class-transformer';

import { IPaginated } from '../interfaces/paginated.interface';

export class Paginated<T> {
  totalPages: number = 0;

  totalResults: number = 0;

  page: number = 0;

  @Type(options => (options.newObject as Paginated<T>).type)
  results: T[] = [];

  private type: Function;

  constructor(options?: IPaginated<Paginated<T>>) {
    if (!options)
      return;
    else if (options.type)
      this.type = options.type;
    else if (options.partial)
      Object.assign(this, options.partial);
  }
}
