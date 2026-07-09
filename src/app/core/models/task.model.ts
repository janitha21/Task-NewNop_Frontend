export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface TaskDto {
  uuid?: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt?: string;
  ownerUuid?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
