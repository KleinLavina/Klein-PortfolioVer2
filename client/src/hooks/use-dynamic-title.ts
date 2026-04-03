import { useEffect } from 'react';

const SECTION_TITLES = {
  home: 'Klein Lavina',
  about: 'Klein Lavina / About',
  skills: 'Klein Lavina / Skills',
  projects: 'Klein Lavina / Projects',
  github: 'Klein Lavina / GitHub',
  contact: 'Klein Lavina / Contact'
};

export function useDynamicTitle(activeSection: string) {
  useEffect(() => {
    const title = SECTION_TITLES[activeSection as keyof typeof SECTION_TITLES] || 'Klein Lavina';
    document.title = title;
  }, [activeSection]);
}
