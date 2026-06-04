export interface LoginFormValues {
  username: string;
  password: string;
}

export interface LoginFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}
