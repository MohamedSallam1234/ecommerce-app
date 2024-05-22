import axios from "axios";

const BASE_URL = "http://localhost:3000/authentication"; // Replace with your backend URL

export const signup = async (data: any) => {
  const response = await axios.post(`${BASE_URL}/signup`, data);
  return response.data;
};

export const verifyEmail = async (token: any) => {
  const response = await axios.get(`${BASE_URL}/verify/${token}`);
  return response.data;
};

export const login = async (data: any) => {
  const response = await axios.post(`${BASE_URL}/login`, data);
  return response.data;
};

export const sendForgotPassword = async (email: any) => {
  const response = await axios.get(`${BASE_URL}/forgot-password/${email}`);
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await axios.post(`${BASE_URL}/reset-password`, data);
  return response.data;
};

export const setAuthToken = (token: any) => {
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};
export const isAuthenticated = () => {
  return !!getAuthToken(); // Check if token exists
};
