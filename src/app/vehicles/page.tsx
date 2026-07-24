import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/shared/components/loading";
import VehicleList from "@/features/vehicles/components/vehicle-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Araçlar | METLAS ERP", description: "Dağıtım araçlarını yönetin" };

export default function VehiclesPage() { return <DashboardLayout><Suspense fallback={<Loading message="Araçlar yükleniyor..." />}><VehicleList /></Suspense></DashboardLayout>; }
