import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import PersonnelForm from "@/features/personnel/components/personnel-form";
export default function NewPersonnelPage() { return <DashboardLayout><div className="space-y-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" render={<Link href="/personnel" />}><ArrowLeft className="size-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">Yeni Personel</h1><p className="text-sm text-muted-foreground">Personel kadrosuna yeni kayıt ekleyin.</p></div></div><PersonnelForm mode="create" /></div></DashboardLayout>; }
