// ─── API Response Types ───────────────────────────────────────────────────────
// Normalised envelope types used by every Route Handler in /app/api.

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
  requestId: string;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
  requestId: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Helper: generate a request ID ───────────────────────────────────────────

export function generateRequestId(): string {
  return `req_${Math.random().toString(36).slice(2, 11)}`;
}

// ─── Helper: build success response ──────────────────────────────────────────

export function ok<T>(data: T, requestId: string, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { data, requestId, ...(meta ? { meta } : {}) };
}

// ─── Helper: build error response ────────────────────────────────────────────

export function err(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  fieldErrors?: Record<string, string[]>,
): ApiError {
  return {
    error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) },
    requestId,
  };
}
