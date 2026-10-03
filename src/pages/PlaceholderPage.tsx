import type { ReactNode } from 'react';
import { colors as c } from '../theme';

export default function PlaceholderPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-5 pt-6 pb-8 max-w-5xl mx-auto">
      <h1 className="display text-2xl md:text-3xl mb-2" style={{ color: c.ink }}>
        {title}
      </h1>
      <p className="body-font text-sm mb-6" style={{ color: c.slate }}>
        Coming up in the build.
      </p>
      {children}
    </div>
  );
}
