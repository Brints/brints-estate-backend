export interface SuccessResponseData<T> {
  message: string;
  data: T;
  statusCode: number;
}
