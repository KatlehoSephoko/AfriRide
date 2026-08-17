export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: any;
}

export const successResponse = <T>(data: T, message?: string, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    meta,
  };
};

export const errorResponse = (message: string, error?: any): ApiResponse<null> => {
  return {
    success: false,
    message,
    error,
  };
};
