"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ban, Check, CircleCheck, ExternalLink, LocateFixed, MapPinned, MoreHorizontal, Play, Route } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from "@/shared/constants/order-status";

type RouteOrder = {
  id: string;
  orderCode: string;
  status: string;
  deliveryDate: string | Date | null;
  customer: {
    id: string;
    fullName: string;
    address: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  vehicle: { id: string; plate: string } | null;
  personnel: { id: string; fullName: string } | null;
};

type RouteStop = { orderId: string; orderCode: string; customerName: string; latitude: number; longitude: number };
type OsrmRoute = { routes?: Array<{ distance?: number; geometry?: { coordinates: Array<[number, number]> } }> };

function googleMapsUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({ api: "1", destination: `${latitude},${longitude}`, travelmode: "driving" });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function googleMapsRouteUrl(orders: RouteOrder[], origin?: [number, number] | null) {
  if (orders.length === 0) return "";
  const last = orders[orders.length - 1].customer;
  const params = new URLSearchParams({
    api: "1",
    destination: `${last.latitude},${last.longitude}`,
    travelmode: "driving",
  });
  if (origin) params.set("origin", `${origin[0]},${origin[1]}`);
  const waypoints = orders.slice(0, -1).map((order) => `${order.customer.latitude},${order.customer.longitude}`).join("|");
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function distanceFrom(origin: [number, number], order: RouteOrder) {
  const latitudeScale = Math.cos(origin[0] * Math.PI / 180);
  return Math.hypot(order.customer.latitude! - origin[0], (order.customer.longitude! - origin[1]) * latitudeScale);
}

function courierIcon() {
  return L.divIcon({ className: "courier-marker", html: '<div style="display:grid;height:38px;width:38px;place-items:center;border:3px solid white;border-radius:999px;background:#2563eb;box-shadow:0 2px 8px #0f172a99"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg></div>', iconSize: [38, 38], iconAnchor: [19, 19] });
}

function orderIcon(color: string, count: number) {
  const size = count > 1 ? 32 : 24;
  return L.divIcon({ className: "order-marker", html: `<div style="display:grid;height:${size}px;width:${size}px;place-items:center;border:2px solid #0f172a;border-radius:999px;background:${color};box-shadow:0 1px 4px #0f172a66;color:white;font-size:12px;font-weight:700">${count > 1 ? count : ""}</div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] });
}

export default function RouteCenter({ orders }: { orders: RouteOrder[] }) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeError, setRouteError] = useState("");
  const [geocodingId, setGeocodingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [courierPosition, setCourierPosition] = useState<[number, number] | null>(null);
  const mappedOrders = useMemo(() => orders
    .filter((order) => order.customer.latitude !== null && order.customer.longitude !== null)
    .sort((a, b) => {
      const first = a.deliveryDate ? new Date(a.deliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
      const second = b.deliveryDate ? new Date(b.deliveryDate).getTime() : Number.MAX_SAFE_INTEGER;
      return first - second;
    }), [orders]);
  const activeMappedOrders = useMemo(() => mappedOrders.filter((order) => order.status !== "DELIVERED"), [mappedOrders]);
  const routeOrigin = useMemo(() => courierPosition ?? (activeMappedOrders[0] ? [activeMappedOrders[0].customer.latitude!, activeMappedOrders[0].customer.longitude!] as [number, number] : null), [activeMappedOrders, courierPosition]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => setCourierPosition([coords.latitude, coords.longitude]), () => undefined, { enableHighAccuracy: true, maximumAge: 300000, timeout: 10000 });
  }, []);

  const saveRouteSnapshot = useCallback(async (distanceKm: number, stops: RouteStop[]) => {
    try {
      await fetch("/api/route-histories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ routeDate: new Date().toISOString().slice(0, 10), distanceKm, stops }) });
    } catch {
      // History recording must not interrupt route operations.
    }
  }, []);

  const updateStatus = useCallback(async (order: RouteOrder, nextStatus: string, skipConfirmation = false) => {
    if (!skipConfirmation && nextStatus === "DELIVERED" && !window.confirm("Siparişi teslim edildi olarak işaretlemek ve stok düşümü yapmak istiyor musunuz?")) return;
    if (!skipConfirmation && nextStatus === "CANCELLED" && !window.confirm("Siparişi iptal etmek istediğinizden emin misiniz?")) return;
    setUpdatingStatus(`${order.id}:${nextStatus}`);
    try {
      const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toISOString().slice(0, 10) : "";
      const response = await fetch(`/api/orders/${order.id}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: order.vehicle?.id, personnelId: order.personnel?.id, deliveryDate, status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Sipariş durumu güncellenemedi");
      toast.success(`Sipariş ${ORDER_STATUS_LABELS[nextStatus]?.toLowerCase() ?? "güncellendi"}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sipariş durumu güncellenemedi");
    } finally {
      setUpdatingStatus(null);
    }
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isConnected || mappedOrders.length === 0) return;
    setRouteError("");
    const controller = new AbortController();
    const markerOrders = [...mappedOrders].sort((first, second) => Number(second.status === "DELIVERED") - Number(first.status === "DELIVERED"));
    const orderCounts = new Map<string, number>();
    mappedOrders.forEach((order) => orderCounts.set(order.customer.id, (orderCounts.get(order.customer.id) ?? 0) + 1));
    const points = markerOrders.map((order) => L.latLng(order.customer.latitude as number, order.customer.longitude as number));
    const fallbackOrigin = courierPosition === null && activeMappedOrders.length > 0;
    const routeOrders = [...activeMappedOrders].sort((first, second) => distanceFrom(routeOrigin!, first) - distanceFrom(routeOrigin!, second));
    const routedOrders = fallbackOrigin ? routeOrders.slice(1) : routeOrders;
    const routePoints = routedOrders.map((order) => L.latLng(order.customer.latitude as number, order.customer.longitude as number));
    const snapshotStops = [...mappedOrders].sort((first, second) => activeMappedOrders.includes(first) && activeMappedOrders.includes(second) ? distanceFrom(routeOrigin!, first) - distanceFrom(routeOrigin!, second) : 0).map((order) => ({ orderId: order.id, orderCode: order.orderCode, customerName: order.customer.fullName, latitude: order.customer.latitude as number, longitude: order.customer.longitude as number }));
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları', maxZoom: 19 }).addTo(map);
    const courierPoint = routeOrigin ? L.latLng(routeOrigin[0], routeOrigin[1]) : null;
    map.fitBounds(L.latLngBounds(courierPoint ? [...points, courierPoint] : points), { padding: [24, 24] });
    if (courierPoint) {
      const courierMarker = L.marker(courierPoint, { icon: courierIcon(), draggable: true }).addTo(map).bindPopup("Kurye konumunu sürükleyerek başlangıç noktasını değiştirin");
      courierMarker.on("dragend", () => { const position = courierMarker.getLatLng(); setCourierPosition([position.lat, position.lng]); });
    }
    points.forEach((point, index) => {
      const order = markerOrders[index];
      const markerColor = order.status === "DELIVERED" ? "#16a34a" : "#dc2626";
      const popup = document.createElement("div");
      popup.className = "min-w-44 text-sm";
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${order.orderCode}`;
      const customer = document.createElement("div");
      customer.className = "mt-1 font-medium";
      customer.textContent = order.customer.fullName;
      const status = document.createElement("div");
      status.className = "text-xs text-slate-500";
      status.textContent = ORDER_STATUS_LABELS[order.status] ?? order.status;
      const address = document.createElement("div");
      address.className = "mt-1 text-xs text-slate-500";
      address.textContent = order.customer.district || order.customer.address || "Adres yok";
      const actions = document.createElement("div");
      actions.className = "mt-3 flex flex-col gap-1.5";
      if (order.status !== "DELIVERED") {
        const deliveredButton = document.createElement("button");
        deliveredButton.type = "button";
        deliveredButton.className = "rounded-md bg-emerald-600 px-2.5 py-1.5 text-left text-xs font-medium text-white hover:bg-emerald-700";
        deliveredButton.textContent = "Teslim edildi olarak işaretle";
        deliveredButton.addEventListener("click", () => { map.closePopup(); void updateStatus(order, "DELIVERED", true); });
        actions.appendChild(deliveredButton);
      }
      const directionsLink = document.createElement("a");
      directionsLink.href = googleMapsUrl(order.customer.latitude as number, order.customer.longitude as number);
      directionsLink.target = "_blank";
      directionsLink.rel = "noreferrer";
      directionsLink.className = "rounded-md border border-slate-300 px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100";
      directionsLink.textContent = "Google Maps yol tarifi";
      actions.appendChild(directionsLink);
      popup.append(title, customer, status, address, actions);
      L.marker(point, { icon: orderIcon(markerColor, orderCounts.get(order.customer.id) ?? 1) }).addTo(map).bindPopup(popup);
    });
    if (routeOrigin && routePoints.length > 0) {
      const coordinates = [`${routeOrigin[1]},${routeOrigin[0]}`, ...routedOrders.map((order) => `${order.customer.longitude},${order.customer.latitude}`)].join(";");
      fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, { signal: controller.signal })
        .then(async (response) => { if (!response.ok) throw new Error(`OSRM rota servisi yanıt vermedi (${response.status})`); return response.json() as Promise<OsrmRoute>; })
        .then((result) => {
          const route = result.routes?.[0];
          const geometry = route?.geometry?.coordinates;
          if (!geometry || geometry.length < 2) throw new Error("Rota oluşturulamadı");
          if (controller.signal.aborted || !mapRef.current?.isConnected) return;
          L.polyline(geometry.map(([lng, lat]) => [lat, lng] as [number, number]), { color: "#2563eb", weight: 5, opacity: 0.8 }).addTo(map);
          void saveRouteSnapshot((route?.distance ?? 0) / 1000, snapshotStops);
        })
        .catch((error) => { if (error instanceof DOMException && error.name === "AbortError") return; if (!controller.signal.aborted) setRouteError(error instanceof Error ? error.message : "Rota oluşturulamadı"); });
    } else {
      void saveRouteSnapshot(0, snapshotStops);
    }
    return () => { controller.abort(); try { map.remove(); } catch { /* Leaflet container already removed */ } };
  }, [activeMappedOrders, courierPosition, mappedOrders, routeOrigin, saveRouteSnapshot, updateStatus]);

  async function geocodeCustomer(customerId: string) {
    setGeocodingId(customerId);
    try {
      const response = await fetch(`/api/customers/${customerId}/geocode`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Adres bulunamadı");
      toast.success("Müşteri konumu bulundu");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Adres konumu bulunamadı");
    } finally {
      setGeocodingId(null);
    }
  }

  const allRouteUrl = googleMapsRouteUrl(activeMappedOrders, routeOrigin);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary"><Route className="size-4" /> Bugünün rotası</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Dağıtım rota merkezi</h2>
          <p className="mt-1 text-sm text-muted-foreground">{activeMappedOrders.length} aktif teslimat rotada. Mavi kurye simgesini sürükleyerek başlangıç noktasını değiştirin; rota en yakından en uzağa hesaplanır.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allRouteUrl && <Button size="sm" variant="outline" render={<a href={allRouteUrl} target="_blank" rel="noreferrer" />}><ExternalLink className="size-4" /> Google Maps rotası</Button>}
          <Button size="sm" variant="outline" render={<Link href="/deliveries" />}><MapPinned className="size-4" /> Dağıtımları yönet</Button>
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative z-0 isolate min-h-[320px] overflow-hidden rounded-2xl border border-border/70 bg-muted">
          {mappedOrders.length === 0 ? <div className="absolute inset-0 grid place-items-center p-8 text-center"><div><MapPinned className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">Haritada gösterilecek koordinat yok</p><p className="mt-1 text-sm text-muted-foreground">Sağdaki siparişlerden “Konumu bul” ile adresleri otomatik çözebilirsiniz.</p></div></div> : <div ref={mapRef} className="absolute inset-0" />}
          {routeError && <div className="absolute inset-x-4 top-4 z-[1000] rounded-lg bg-red-50 p-3 text-xs text-red-700 shadow">{routeError}</div>}
        </div>
        <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
          {orders.map((order) => {
            const hasCoordinates = mappedOrders.some((mapped) => mapped.id === order.id);
            const delivered = order.status === "DELIVERED";
            const nextStatuses = (ORDER_STATUS_TRANSITIONS[order.status] ?? []).filter((status) => status !== order.status);
            return <div key={order.id} className={`rounded-xl border-l-4 p-3 transition-colors hover:bg-muted ${delivered ? "border-l-emerald-500" : "border-l-red-500"}`}>
              <div className="flex items-start gap-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${delivered ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{orders.indexOf(order) + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><Link href={`/orders/${order.id}`} className="font-mono text-xs font-semibold hover:text-primary">{order.orderCode}</Link><span className="text-[11px] font-medium text-muted-foreground">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span></div><p className="mt-1 truncate text-sm font-medium">{order.customer.fullName}</p><p className="truncate text-xs text-muted-foreground">{order.customer.district || order.customer.address || "Adres yok"}</p></div></div>
              <div className="mt-3 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="xs" variant="outline"><MoreHorizontal className="size-3.5" /> İşlemler</Button>} />
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Sipariş işlemleri</DropdownMenuLabel>
                    {hasCoordinates ? <DropdownMenuItem render={<a href={googleMapsUrl(order.customer.latitude as number, order.customer.longitude as number)} target="_blank" rel="noreferrer" />}><LocateFixed className="size-4" /> Google Maps yol tarifi</DropdownMenuItem> : <DropdownMenuItem onClick={() => geocodeCustomer(order.customer.id)} disabled={geocodingId === order.customer.id}><LocateFixed className="size-4" /> {geocodingId === order.customer.id ? "Konum bulunuyor" : "Konumu bul"}</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Durumu güncelle</DropdownMenuLabel>
                    {nextStatuses.length > 0 ? nextStatuses.map((nextStatus) => <DropdownMenuItem key={nextStatus} variant={nextStatus === "CANCELLED" ? "destructive" : "default"} onClick={() => updateStatus(order, nextStatus)} disabled={updatingStatus !== null}>{nextStatus === "CONFIRMED" ? <Check className="size-4" /> : nextStatus === "DELIVERING" ? <Play className="size-4" /> : nextStatus === "DELIVERED" ? <CircleCheck className="size-4" /> : <Ban className="size-4" />}{ORDER_STATUS_LABELS[nextStatus]}</DropdownMenuItem>) : <DropdownMenuItem disabled>Sipariş kapanmış</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>;
          })}
        </div>
      </div>
    </section>
  );
}
