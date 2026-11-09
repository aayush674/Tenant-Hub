export const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// One place to read DRF errors in any shape
export const extractError = (data, fallback) =>
  data?.detail || data?.otp || Object.values(data || {}).flat()[0] || fallback;
