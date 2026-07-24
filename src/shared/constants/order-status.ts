export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  DELIVERING: "Dağıtımda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  DELIVERING: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/20",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  CANCELLED: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/20",
};
