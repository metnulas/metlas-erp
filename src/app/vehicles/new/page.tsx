import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import VehicleForm from "@/features/vehicles/components/vehicle-form";

export default function NewVehiclePage() { return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/vehicles" />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Yeni Araç</h1><p className="text-sm text-muted-foreground">Araç filosuna yeni bir kayıt ekleyin.</p></div></div><VehicleForm mode="create" /></div></DashboardLayout>; }
