type ValidationState = {
  email: string | null;
  name: string | null;
  password: string | null;
};

export type ValidationStateKey = keyof ValidationState;

type ValidationAction =
  | { type: 'SET_EMAIL_ERROR'; payload: string }
  | { type: 'SET_NAME_ERROR'; payload: string }
  | { type: 'SET_PASSWORD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' };

export type ValidationStateType = ValidationAction['type'];

const initialState: ValidationState = {
  email: null,
  name: null,
  password: null,
};

const validationReducer = (state: ValidationState, action: ValidationAction): ValidationState => {
  switch (action.type) {
    case 'SET_EMAIL_ERROR':
      return { ...state, email: action.payload };
    case 'SET_NAME_ERROR':
      return { ...state, name: action.payload };
    case 'SET_PASSWORD_ERROR':
      return { ...state, password: action.payload };
    case 'CLEAR_ERRORS':
      return { ...state, email: null, name: null, password: null };
    default:
      return state;
  }
};

export { validationReducer, initialState };