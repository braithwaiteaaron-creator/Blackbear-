import { NextResponse } from "next/server";

export const API_ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  RETAKE_COOLDOWN_ACTIVE: "RETAKE_COOLDOWN_ACTIVE",
  IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      ok: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiOk<T>(data: T, status = 200) {
  return apiSuccess(data, status);
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json<ApiErrorResponse>(
    {
      ok: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}
