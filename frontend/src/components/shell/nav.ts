import type { IconName } from '@/components/ui/Icon';

export interface NavItem { href: string; label: string; icon: IconName; badge?: 'actions' | 'alerts' }
export interface NavGroup { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { title: 'Your position', items: [
    { href: '/', label: 'Overview', icon: 'grid' },
    { href: '/scorecard', label: 'Audit Scorecard', icon: 'shield' },
    { href: '/actions', label: 'Action Queue', icon: 'list', badge: 'actions' },
    { href: '/alerts', label: 'Alerts', icon: 'bell', badge: 'alerts' },
  ] },
  { title: 'Evidence', items: [
    { href: '/ledger', label: 'Contact Ledger', icon: 'book' },
    { href: '/consent', label: 'Consent Integrity', icon: 'check-circle' },
    { href: '/revocation', label: 'Revocation Integrity', icon: 'undo' },
    { href: '/vault', label: 'Evidence Vault', icon: 'lock' },
  ] },
  { title: 'Intelligence', items: [
    { href: '/conduct', label: 'Contact Conduct', icon: 'phone' },
    { href: '/leads', label: 'Lead Provenance', icon: 'funnel' },
    { href: '/vendors', label: 'Vendor Ledger', icon: 'building' },
    { href: '/metrics', label: 'Metrics Library', icon: 'bars' },
  ] },
  { title: 'Disclosure', items: [
    { href: '/sources', label: 'Source Registry', icon: 'database' },
    { href: '/reports', label: 'Reports & Exports', icon: 'file' },
  ] },
  { title: 'Engagement', items: [
    { href: '/scope', label: 'Scope & Boundaries', icon: 'target' },
    { href: '/rulebook', label: 'Rulebook', icon: 'sliders' },
    { href: '/regulatory', label: 'Regulatory Changes', icon: 'landmark' },
  ] },
  { title: 'Account', items: [
    { href: '/setup', label: 'Setup & Readiness', icon: 'clipboard' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
    { href: '/users', label: 'Users & Access', icon: 'users' },
  ] },
];
