import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PortalShell } from '@/components/shell/PortalShell';
import { NAV } from '@/components/shell/nav';
import { findBannedWords } from '@/lib/wording';
import { mockApi } from '@/mock/api';
import { ActionsScreen } from '@/screens/actions/ActionsScreen';
import { AlertsScreen } from '@/screens/alerts/AlertsScreen';
import { ConductScreen } from '@/screens/conduct/ConductScreen';
import { ConsentScreen } from '@/screens/consent/ConsentScreen';
import { EvidenceFileScreen } from '@/screens/evidence/EvidenceFileScreen';
import { LeadsScreen } from '@/screens/leads/LeadsScreen';
import { LedgerScreen } from '@/screens/ledger/LedgerScreen';
import { MetricsScreen } from '@/screens/metrics/MetricsScreen';
import { OverviewScreen } from '@/screens/overview/OverviewScreen';
import { RegulatoryScreen } from '@/screens/regulatory/RegulatoryScreen';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';
import { RevocationScreen } from '@/screens/revocation/RevocationScreen';
import { RulebookScreen } from '@/screens/rulebook/RulebookScreen';
import { ScopeScreen } from '@/screens/scope/ScopeScreen';
import { ScorecardScreen } from '@/screens/scorecard/ScorecardScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { SetupScreen } from '@/screens/setup/SetupScreen';
import { SignInScreen } from '@/screens/signin/SignInScreen';
import { SourcesScreen } from '@/screens/sources/SourcesScreen';
import { UsersScreen } from '@/screens/users/UsersScreen';
import { VaultScreen } from '@/screens/vault/VaultScreen';
import { VendorsScreen } from '@/screens/vendors/VendorsScreen';
import { navState } from '../nav';
import { renderScreen } from '../utils';

// Every screen, the text that proves it loaded its data, and its page title.
const SCREENS: [string, React.ReactElement, string | RegExp][] = [
  ['Overview', <OverviewScreen key="o" />, 'Do these first'],
  ['Audit Scorecard', <ScorecardScreen key="s" />, 'Domain register'],
  ['Action Queue', <ActionsScreen key="a" />, 'Queue'],
  ['Alerts', <AlertsScreen key="al" />, 'Inbox'],
  ['Contact Ledger', <LedgerScreen key="l" />, '(916) •••-4471'],
  ['Consent Integrity', <ConsentScreen key="c" />, 'Most common reasons'],
  ['Revocation Integrity', <RevocationScreen key="r" />, 'Opt-out test matrix'],
  ['Evidence Vault', <VaultScreen key="v" />, 'Position lookup'],
  ['Contact Conduct', <ConductScreen key="cc" />, 'Contacts by hour of day'],
  ['Lead Provenance', <LeadsScreen key="lp" />, 'Most frequent signals'],
  ['Vendor Ledger', <VendorsScreen key="vl" />, 'Vendor scores'],
  ['Metrics Library', <MetricsScreen key="m" />, 'Consent Coverage'],
  ['Source Registry', <SourcesScreen key="sr" />, 'Upload centre'],
  ['Reports & Exports', <ReportsScreen key="re" />, 'Bulk evidence export'],
  ['Scope & Boundaries', <ScopeScreen key="sc" />, 'Comply iV never'],
  ['Rulebook', <RulebookScreen key="rb" />, 'Settings in force'],
  ['Regulatory Changes', <RegulatoryScreen key="rc" />, /FCC adopts/],
  ['Setup & Readiness', <SetupScreen key="su" />, 'What each check found'],
  ['Settings', <SettingsScreen key="st" />, 'Litigation forum'],
  ['Users & Access', <UsersScreen key="u" />, 'People with access'],
];

describe('screens', () => {
  it.each(SCREENS)('%s loads and uses no banned wording', async (title, ui, proof) => {
    const { container } = renderScreen(ui);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect((await screen.findAllByText(proof)).length).toBeGreaterThan(0);
    expect(findBannedWords(container.textContent ?? '')).toEqual([]);
  });

  it('has a menu entry for every screen', () => {
    const labels = NAV.flatMap((g) => g.items.map((i) => i.label));
    expect(labels).toEqual(SCREENS.map(([title]) => title));
  });
});

describe('shell', () => {
  it('shows the menu, the sample-data chip, the disclaimer and the open-action count', async () => {
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    expect(await screen.findByText('page body')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('link')).toHaveLength(20);
    expect(await within(nav).findByLabelText('10 open')).toBeInTheDocument();
    expect(screen.getByText('Sample data')).toBeInTheDocument();
    expect(screen.getByText(/Comply iV is not a law firm/)).toBeInTheDocument();
  });

  it('sends a signed-out visitor to the sign-in page', async () => {
    mockApi({ method: 'POST', path: '/session/sign-out' });
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    await waitFor(() => expect(navState.push).toHaveBeenCalledWith('/sign-in'));
    expect(screen.queryByText('page body')).not.toBeInTheDocument();
  });

  it('locks an operations user out when the engagement is counsel-directed', async () => {
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'operations', engagementMode: 'counsel_directed' } });
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    expect(await screen.findByText('This engagement is counsel-directed')).toBeInTheDocument();
    expect(screen.queryByText('page body')).not.toBeInTheDocument();
  });

  it('finds a domain from the search box and opens its panel', async () => {
    const user = userEvent.setup();
    renderScreen(<PortalShell><p>page body</p></PortalShell>);
    await user.type(await screen.findByRole('combobox', { name: 'Search' }), 'opt-out');
    await user.click(await screen.findByRole('button', { name: /Opt-out handling/ }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

describe('interactions', () => {
  it('opens a domain panel from the scorecard and switches tabs', async () => {
    const user = userEvent.setup();
    renderScreen(<ScorecardScreen />);
    await user.click(await screen.findByRole('button', { name: /^Opt-out handling:/ }));
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('Top finding')).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Definition' }));
    expect(within(panel).queryByText('Top finding')).not.toBeInTheDocument();
  });

  it('assigns an action and attaches a note contesting the finding', async () => {
    const user = userEvent.setup();
    renderScreen(<ActionsScreen />);
    await user.click(await screen.findByRole('button', { name: 'Restore the missing checklist item on the quote form' }));
    const panel = await screen.findByRole('dialog');
    await user.selectOptions(await within(panel).findByLabelText('Assigned to'), 'Marcus Lee');
    await waitFor(() => expect(within(panel).getByLabelText('Assigned to')).toHaveValue('Marcus Lee'));
    await user.type(within(panel).getByLabelText('Note contesting the finding'), 'The form was restored on 29 Sep.');
    await user.click(within(panel).getByRole('button', { name: 'Attach note' }));
    expect(await within(panel).findByText(/Contested by/)).toBeInTheDocument();
  });

  it('filters the ledger by status', async () => {
    const user = userEvent.setup();
    renderScreen(<LedgerScreen />);
    expect(await screen.findByText('(916) •••-4471')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'No proof' }));
    await waitFor(() => expect(screen.queryByText('(916) •••-4471')).not.toBeInTheDocument());
    expect(screen.getByText('(480) •••-0923')).toBeInTheDocument();
  });

  it('marks an alert as reviewed', async () => {
    const user = userEvent.setup();
    renderScreen(<AlertsScreen />);
    const before = (await screen.findAllByRole('button', { name: 'Mark as reviewed' })).length;
    await user.click(screen.getAllByRole('button', { name: 'Mark as reviewed' })[0]);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Mark as reviewed' })).toHaveLength(before - 1));
  });

  it('verifies a fingerprint in the vault', async () => {
    const user = userEvent.setup();
    renderScreen(<VaultScreen />);
    await user.click(await screen.findByRole('button', { name: 'Use a sample fingerprint' }));
    await user.click(screen.getByRole('button', { name: 'Verify' }));
    expect(await screen.findByText('Matches a stored record')).toBeInTheDocument();
  });

  it('sets and releases a legal hold', async () => {
    const user = userEvent.setup();
    renderScreen(<VaultScreen />);
    await user.type(await screen.findByLabelText('Which one'), '(916) 555-0142');
    await user.type(screen.getByLabelText('Reason'), 'Complaint received');
    await user.click(screen.getByRole('button', { name: 'Set hold' }));
    expect(await screen.findByText('Complaint received')).toBeInTheDocument();
    const releases = screen.getAllByRole('button', { name: 'Release' });
    await user.click(releases[0]);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Release' })).toHaveLength(releases.length - 1));
  });

  it('shows the evidence file for a number, and a clear message for an unknown one', async () => {
    const { unmount } = renderScreen(<EvidenceFileScreen phone="+14805550923" />);
    expect(await screen.findByText('Proof elements')).toBeInTheDocument();
    expect(screen.getByText('Opt-out received')).toBeInTheDocument();
    unmount();
    renderScreen(<EvidenceFileScreen phone="+10000000000" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No evidence file for this number');
  });

  it('invites a user and removes access', async () => {
    const user = userEvent.setup();
    renderScreen(<UsersScreen />);
    await user.type(await screen.findByLabelText('Name'), 'New Person');
    await user.type(screen.getByLabelText('Email'), 'new.person@sunpath.example');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));
    expect(await screen.findByText('new.person@sunpath.example')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove access for New Person' }));
    await waitFor(() => expect(screen.queryByText('new.person@sunpath.example')).not.toBeInTheDocument());
  });

  it('shows rulebook impact only to CiV staff', async () => {
    const { unmount } = renderScreen(<RulebookScreen />);
    expect(await screen.findByText('Settings in force')).toBeInTheDocument();
    expect(screen.queryByText('Rulebook impact')).not.toBeInTheDocument();
    unmount();
    mockApi({ method: 'POST', path: '/session/view-as', body: { role: 'admin' } });
    renderScreen(<RulebookScreen />);
    expect(await screen.findByText('Rulebook impact')).toBeInTheDocument();
  });

  it('signs in and goes to the overview', async () => {
    const user = userEvent.setup();
    mockApi({ method: 'POST', path: '/session/sign-out' });
    renderScreen(<SignInScreen />);
    await user.type(screen.getByLabelText('Email'), 'dana.reyes@sunpath.example');
    await user.type(screen.getByLabelText('Password'), 'anything');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(navState.push).toHaveBeenCalledWith('/'));
  });
});
