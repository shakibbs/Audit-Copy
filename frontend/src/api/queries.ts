// One hook per endpoint. Screens never call fetch directly.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiSend } from './client';
import type {
  AccessEntry, Action, Alert, Conduct, ConsentPage, ConsentSummary, Contact, Domain, EvidenceFile, HashCheck, Leads, LegalHold,
  Metric, Position, Readiness, RegChange, ReportRun, ReportType, Revocation, Rulebook, ScoreSummary, SearchHit, Session, Settings,
  Source, Upload, User, VaultStats, VendorSummary,
} from './types';

type Query = Record<string, string | undefined>;

function useGet<T>(path: string, query: Query = {}, enabled = true) {
  return useQuery({ queryKey: [path, query], queryFn: () => apiGet<T>(path, query), enabled });
}

export const useSession = () => useQuery({ queryKey: ['/session'], queryFn: () => apiGet<Session>('/session') });
export const useScore = (period?: string) => useGet<ScoreSummary>('/score', { period });
export const useDomains = (period?: string) => useGet<Domain[]>('/domains', { period });
export const useActions = () => useGet<Action[]>('/actions');
export const useAlerts = () => useGet<Alert[]>('/alerts');
export const useContacts = (status: string, q: string) => useGet<Contact[]>('/contacts', { status, q });
export const useConsent = () => useGet<ConsentSummary>('/consent');
export const useConsentPages = () => useGet<ConsentPage[]>('/consent-pages');
export const useRevocation = () => useGet<Revocation>('/revocation');
export const useVault = () => useGet<VaultStats>('/vault');
export const usePosition = (phone: string, date: string) => useGet<Position>('/position', { phone, date }, Boolean(phone && date));
export const useHashCheck = (hash: string) => useGet<HashCheck>('/hash-check', { hash }, hash.length > 0);
export const useLegalHolds = () => useGet<LegalHold[]>('/legal-holds');
export const useEvidenceFile = (phone: string) => useGet<EvidenceFile>(`/evidence/${encodeURIComponent(phone)}`);
export const useMetrics = (period?: string) => useGet<Metric[]>('/metrics', { period });
export const useConduct = () => useGet<Conduct>('/conduct');
export const useLeads = () => useGet<Leads>('/leads');
export const useVendors = () => useGet<VendorSummary>('/vendors');
export const useSources = () => useGet<Source[]>('/sources');
export const useUploads = () => useGet<Upload[]>('/uploads');
export const useReports = () => useGet<{ types: ReportType[]; runs: ReportRun[] }>('/reports');
export const useRulebook = () => useGet<Rulebook>('/rulebook');
export const useRegChanges = () => useGet<RegChange[]>('/reg-changes');
export const useReadiness = () => useGet<Readiness>('/readiness');
export const useSettings = () => useGet<Settings>('/settings');
export const useUsers = () => useGet<User[]>('/users');
export const useAccessLog = () => useGet<AccessEntry[]>('/access-log');
export const useSearch = (q: string) => useGet<SearchHit[]>('/search', { q }, q.trim().length >= 2);

export interface SendArgs { method: 'POST' | 'PATCH' | 'DELETE'; path: string; body?: unknown }

/** Sends a change, then refetches every query so each screen shows the new state. */
export function useSend<T = unknown>() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ method, path, body }: SendArgs) => apiSend<T>(method, path, body),
    onSuccess: () => client.invalidateQueries(),
  });
}
