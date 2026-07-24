import DashboardLayout from "@/components/layout/DashboardLayout";
import DeliveryList from "@/features/deliveries/components/delivery-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dağıtım | METLAS ERP", description: "Günlük dağıtım operasyonunu yönetin" };
export default function DeliveriesPage() { return <DashboardLayout><DeliveryList /></DashboardLayout>; }
