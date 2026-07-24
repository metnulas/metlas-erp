import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/shared/components/loading";
import PersonnelList from "@/features/personnel/components/personnel-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Personeller | METLAS ERP", description: "Dağıtım ekibini yönetin" };
export default function PersonnelPage() { return <DashboardLayout><Suspense fallback={<Loading message="Personeller yükleniyor..." />}><PersonnelList /></Suspense></DashboardLayout>; }
