export interface ApiResponseOptions {
  message?: string;
  meta?: Record<string, unknown>;
}

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly data: T;
  public readonly message?: string;
  public readonly meta?: Record<string, unknown>;

  constructor(data: T, options?: ApiResponseOptions) {
    this.success = true;
    this.data = data;
    this.message = options?.message;
    this.meta = options?.meta;
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, { message });
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): ApiResponse<T[]> {
    return new ApiResponse(data, {
      message,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  }
}
