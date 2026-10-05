import { EvidenceFileScreen } from '@/screens/evidence/EvidenceFileScreen';

export default async function Page({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  return <EvidenceFileScreen phone={decodeURIComponent(phone)} />;
}
