import React, { useReducer, useRef, useState } from 'react'

import './App.css'
import { Input } from "@/components/ui/input"
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { LoadingButton } from './components/ui/loading-button'
import { validationReducer, initialState, type ValidationStateKey, type ValidationStateType } from './reducers/validationReducer';
import { useNavigate } from 'react-router-dom';
import { authService } from "@/server/api/auth";

import { AuthError, AuthErrorCodes } from 'firebase/auth';
import { useAuth } from './context/AuthContext'

// Add error messages map
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AuthErrorCodes.EMAIL_EXISTS]: 'Email already exists, please login',
  [AuthErrorCodes.INVALID_LOGIN_CREDENTIALS]: 'Invalid password / email',
  [AuthErrorCodes.INVALID_EMAIL]: 'Invalid email format',
  // Add more error codes as needed
};

const App = () => {
  const { handleSetUser } = useAuth();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(validationReducer, initialState);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const validateField = (field: ValidationStateKey, value: string | null | undefined, errorMessage: string, optional: boolean = false) => {
    if (optional && !!state[field]) {
      dispatch({ type: `SET_${field.toUpperCase()}_ERROR` as ValidationStateType, payload: '' });
      return false;
    } else if (optional) {
      return false;
    }


    if (!value) {
      dispatch({ type: `SET_${field.toUpperCase()}_ERROR` as ValidationStateType, payload: errorMessage });
      return true
    } else {
      dispatch({ type: `SET_${field.toUpperCase()}_ERROR` as ValidationStateType, payload: '' });
      return false;
    }
  };


  const handleRegister = async () => {
    setAuthError(null);
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const name = nameRef.current?.value;

    const nameError = validateField('name', name, 'Name is required');
    const emailError = validateField('email', email, 'Email is required');
    const passwordError = validateField('password', password, 'Password is required');

    // check if all fields are valid
    if (nameError || emailError || passwordError) return

    try {
      await authService.signup(email!, password!, name!);

    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = AUTH_ERROR_MESSAGES[authError.code] || 'An error occurred';
      setAuthError(errorMessage);
      console.error(authError);
    }

  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setLoading(true);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const name = nameRef.current?.value;

    const nameError = validateField('name', name, 'Name is required', true);
    const emailError = validateField('email', email, 'Email is required');
    const passwordError = validateField('password', password, 'Password is required');

    // check if all fields are valid
    if (nameError || emailError || passwordError) return

    try {
      const result = await authService.login(email!, password!);
      handleSetUser(
        {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: name || result.user.displayName || '',
          photoURL: result.user.photoURL || ''
        }
      );

      navigate('/search-chat');
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      const errorMessage = AUTH_ERROR_MESSAGES[authError.code] || 'An error occurred';
      setAuthError(errorMessage);
      console.error(authError);
    }
  };


  return (
    <div className="h-[100vh] flex justify-center items-center">
      <Card className="min-w-[320px] w-full max-w-lg m-2">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Authentication
          </h2>
          <form className="space-y-4 mb-4" onSubmit={(event) => handleLogin(event)}>
            <div>
              <Input type="text" placeholder="Name" ref={nameRef} className="w-full" />
              {state.name && <p className="text-red-500">{state.name}</p>}
            </div>
            <div>
              <Input type="email" placeholder="Email" ref={emailRef} className="w-full" />
              {state.email && <p className="text-red-500">{state.email}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password" ref={passwordRef} className="w-full" />
              {state.password && <p className="text-red-500">{state.password}</p>}
            </div>
            <div className="flex justify-between space-x-4">
              <LoadingButton type='submit' className="w-full" loading={loading}>Login</LoadingButton>
              <Button type="button" variant="outline" className="w-full" onClick={handleRegister} disabled={loading}>Register</Button>
            </div>
          </form>

          {authError && <p className="text-red-500">{authError}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
