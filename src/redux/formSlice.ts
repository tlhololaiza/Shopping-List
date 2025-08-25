import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RegisterData, User } from '../utils/types';

interface FormState {
  login: {
    email: string;
    password: string;
    error: string;
  };
  register: {
    formData: RegisterData;
    confirmPassword: string;
    error: string;
  };
  profile: {
    formData: Partial<User>;
    password: string;
    confirmPassword: string;
    passwordsMatch: boolean;
    error: string;
    success: string;
  };
}

const initialFormData: RegisterData = {
  name: '',
  surname: '',
  email: '',
  password: '',
  cellNumber: '',
};

const initialState: FormState = {
  login: {
    email: '',
    password: '',
    error: '',
  },
  register: {
    formData: initialFormData,
    confirmPassword: '',
    error: '',
  },
  profile: {
    formData: {},
    password: '',
    confirmPassword: '',
    passwordsMatch: true,
    error: '',
    success: '',
  },
};

const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    setLoginEmail: (state, action: PayloadAction<string>) => {
      state.login.email = action.payload;
    },
    setLoginPassword: (state, action: PayloadAction<string>) => {
      state.login.password = action.payload;
    },
    setLoginError: (state, action: PayloadAction<string>) => {
      state.login.error = action.payload;
    },
    setRegisterFormData: (state, action: PayloadAction<Partial<RegisterData>>) => {
      state.register.formData = { ...state.register.formData, ...action.payload };
    },
    setRegisterConfirmPassword: (state, action: PayloadAction<string>) => {
      state.register.confirmPassword = action.payload;
    },
    setRegisterError: (state, action: PayloadAction<string>) => {
      state.register.error = action.payload;
    },
    setProfileFormData: (state, action: PayloadAction<Partial<User>>) => {
      state.profile.formData = { ...state.profile.formData, ...action.payload };
    },
    setProfilePassword: (state, action: PayloadAction<string>) => {
      state.profile.password = action.payload;
    },
    setProfileConfirmPassword: (state, action: PayloadAction<string>) => {
      state.profile.confirmPassword = action.payload;
    },
    setPasswordsMatch: (state, action: PayloadAction<boolean>) => {
      state.profile.passwordsMatch = action.payload;
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.profile.error = action.payload;
    },
    setProfileSuccess: (state, action: PayloadAction<string>) => {
      state.profile.success = action.payload;
    },
    resetFormState: (state) => {
      state.login = initialState.login;
      state.register = initialState.register;
      state.profile = initialState.profile;
    },
  },
});

export const {
  setLoginEmail,
  setLoginPassword,
  setLoginError,
  setRegisterFormData,
  setRegisterConfirmPassword,
  setRegisterError,
  setProfileFormData,
  setProfilePassword,
  setProfileConfirmPassword,
  setPasswordsMatch,
  setProfileError,
  setProfileSuccess,
  resetFormState,
} = formSlice.actions;

export default formSlice.reducer;