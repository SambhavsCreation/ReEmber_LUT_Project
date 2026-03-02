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

export function getMediaImageUploadUrl() {
  return `${getBackendBaseUrl()}/api/media/images/upload-url`;
}

export function getMediaImageFetchUrl() {
  return `${getBackendBaseUrl()}/api/media/images/fetch-url`;
}

export function getMediaVideoUploadUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/upload-url`;
}

export function getMediaVideoFetchUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/fetch-url`;
}

export function getMediaVideoMultipartInitUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/multipart/init`;
}

export function getMediaVideoMultipartPartUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/multipart/part-url`;
}

export function getMediaVideoMultipartCompleteUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/multipart/complete`;
}

export function getMediaVideoMultipartAbortUrl() {
  return `${getBackendBaseUrl()}/api/media/videos/multipart/abort`;
}
