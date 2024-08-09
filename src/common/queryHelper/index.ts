import { SelectQueryBuilder } from 'typeorm';

interface QueryOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  skip?: number;
  limit?: number;
}

function applyQueryOptions(
  queryBuilder: SelectQueryBuilder<any>,
  options: QueryOptions,
  tableName: string,
) {
  // Apply sorting if provided
  if (options.sortBy && options.sortOrder) {
    queryBuilder.orderBy(
      `${tableName}.${options.sortBy}`,
      options.sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );
  }

  // Apply pagination if provided
  if (options.skip >= 0 && options.limit) {
    queryBuilder.take(options.limit).skip(options.skip);
  }
}

export default applyQueryOptions;
