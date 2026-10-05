'use client';

import { ActionDrawer } from '@/components/drawers/ActionDrawer';
import { ContactDrawer } from '@/components/drawers/ContactDrawer';
import { DomainDrawer } from '@/components/drawers/DomainDrawer';
import { MetricDrawer } from '@/components/drawers/MetricDrawer';
import { VendorDrawer } from '@/components/drawers/VendorDrawer';
import { useDrawer } from '@/state/DrawerContext';

/** Renders whichever detail panel is open. */
export function DrawerHost() {
  const { target, close } = useDrawer();
  if (!target) return null;
  const props = { id: target.id, onClose: close };
  switch (target.kind) {
    case 'domain': return <DomainDrawer key={target.id} {...props} />;
    case 'metric': return <MetricDrawer key={target.id} {...props} />;
    case 'contact': return <ContactDrawer key={target.id} {...props} />;
    case 'action': return <ActionDrawer key={target.id} {...props} />;
    case 'vendor': return <VendorDrawer key={target.id} {...props} />;
  }
}
