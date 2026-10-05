import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { DrawerHost } from '@/components/shell/DrawerHost';
import { DrawerProvider } from '@/state/DrawerContext';
import { PortalProvider } from '@/state/PortalContext';

/** Renders a screen inside the providers the portal shell supplies, with the drawer host mounted. */
export function renderScreen(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PortalProvider>
        <DrawerProvider>
          {ui}
          <DrawerHost />
        </DrawerProvider>
      </PortalProvider>
    </QueryClientProvider>,
  );
}
