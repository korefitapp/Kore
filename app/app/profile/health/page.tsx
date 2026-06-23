import { getHealthData } from "@/app/actions/profile-actions";
import { HealthClient } from "./HealthClient";

export const metadata = {
  title: "Dados de Saúde",
};

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const healthData = await getHealthData();

  if (!healthData) {
    return null; // ou loading state
  }

  return <HealthClient defaultValues={healthData} />;
}