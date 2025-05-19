export interface Course {
  id: number;
  title: string;
  description?: string;
  teacherId: number;
  enrolled?: boolean; // New property to track enrollment status
}