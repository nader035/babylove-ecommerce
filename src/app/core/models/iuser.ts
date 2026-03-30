// src/app/core/models/user.model.ts


export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  

  phoneNumber?: string;
  addresses?: Address[]; 
  isActive?: boolean;
}

export interface SignUpParams {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse extends User {
  accessToken: string;
  refreshToken: string;
}

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  provinceId: number; 
  province?: Province;
}

export interface Address {
  id: number;
  detail: string;
  postCode: string;
  cityId: number;
  city?: City;
  isDefault?: boolean; 
}