export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekleyen dağıtım",
  CONFIRMED: "Bekleyen dağıtım",
  DELIVERING: "Bekleyen dağıtım",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  CONFIRMED: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  DELIVERING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  CANCELLED: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20",
};

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PENDING", "DELIVERING", "DELIVERED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "DELIVERING", "DELIVERED", "CANCELLED"],
  DELIVERING: ["DELIVERING", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};
