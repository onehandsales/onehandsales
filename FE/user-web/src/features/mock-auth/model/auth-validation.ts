// 기능 : 원본 최소 10자와 구분되는 목 강도 표시를 입력 자체만으로 계산한다.
export function passwordStrength(password: string): "" | "Too Weak" | "Strong" {
  if (!password) return "";
  const categories = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(pattern => pattern.test(password)).length;
  return password.length >= 10 && categories >= 3 ? "Strong" : "Too Weak";
}
// 기능 : 가입 필드별 오류를 표시하기 위한 로컬 검증 결과를 만든다.
export function validateSignup(email: string, name: string, password: string, captcha: boolean) {
  const errors: Partial<Record<"email" | "name" | "password" | "captcha", string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 256) errors.email = "Enter a valid email address.";
  if (!name.trim() || name.length > 100) errors.name = "Enter your full name (up to 100 characters).";
  if (password.length < 10) errors.password = "The password must be no less than 10 characters long.";
  else if (password.length > 128) errors.password = "Use no more than 128 characters.";
  else if (passwordStrength(password) !== "Strong") errors.password = "Password is too weak. Use a varied sample password.";
  if (!captcha) errors.captcha = "Complete the local preview check.";
  return errors;
}
