const API_ORIGIN = "http://localhost:5000";

export function resolveStudentPhotoUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    return `${API_ORIGIN}/api/v1${trimmed}`;
  }
  if (trimmed.startsWith("/api/v1/")) {
    return `${API_ORIGIN}${trimmed}`;
  }
  return trimmed;
}
