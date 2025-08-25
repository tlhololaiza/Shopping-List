export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  password?: string; 
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  cellNumber: string;
}