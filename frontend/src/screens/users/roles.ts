import type { Role } from '@/api/types';

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner', legal: 'Legal', operations: 'Operations', read_only: 'Read-only', counsel_guest: 'Outside counsel (read-only)',
  admin: 'CiV admin', counsel: 'CiV counsel', engineer: 'CiV engineer',
};

/** Roles a client can give to its own people. */
export const CLIENT_ROLES: Role[] = ['legal', 'operations', 'read_only', 'counsel_guest'];

export const ROLE_CAN: Record<string, string> = {
  owner: 'Everything, including users and settings',
  legal: 'All findings, evidence files, exports and legal holds',
  operations: 'Actions, sources and uploads; no evidence files',
  read_only: 'View only; no exports',
  counsel_guest: 'View only, limited to chosen months; you can switch it off',
};
