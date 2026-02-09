const DEFAULT_BACKEND_BASE = "https://rs7vip8vmn.us-east-1.awsapprunner.com";

export function getBackendBaseUrl() {
  const fromEnv = (process.env.BACKEND_BASE_URL || "").trim();
  const value = fromEnv || DEFAULT_BACKEND_BASE;
  return value.replace(/\/+$/, "");
}

export function getAuthVerifyUrl() {
  return `${getBackendBaseUrl()}/api/auth/verify`;
}

export function getAuthMeUrl() {
  return `${getBackendBaseUrl()}/api/auth/me`;
}

export function getAuthRegisterUrl() {
  return `${getBackendBaseUrl()}/api/auth/register`;
}

export function getAuthConfirmSignUpUrl() {
  return `${getBackendBaseUrl()}/api/auth/confirm-signup`;
}

export function getAuthResendCodeUrl() {
  return `${getBackendBaseUrl()}/api/auth/resend-code`;
}

export function getAuthLoginUrl() {
  return `${getBackendBaseUrl()}/api/auth/login`;
}
