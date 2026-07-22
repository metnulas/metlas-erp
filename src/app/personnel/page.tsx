import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loading from "@/shared/components/loading";
import PersonnelList from "@/features/personnel/components/personnel-list";
export default function PersonnelPage() { return <DashboardLayout><Suspense fallback={<Loading message="Personeller yükleniyor..." />}><PersonnelList /></Suspense></DashboardLayout>; }
