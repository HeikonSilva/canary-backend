export default function validatePassword(
  password: string
): Record<string, boolean> {
  const errors: Record<string, boolean> = {}

  if (!/[A-Z]/.test(password)) errors.passwordMissingUppercase = true
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.passwordMissingSpecialCharacter = true
  if (!/\d/.test(password)) errors.passwordMissingNumber = true
  if (!/[a-z]/.test(password)) errors.passwordMisssingLowercase = true
  if (password.length < 8) errors.passwordTooShort = true

  return errors
}
