import type { ManifestV3Export } from '@crxjs/vite-plugin';
import { version } from '../package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'AI Post Assistant',
  version: version || '1.0.0',
  description: 'Generate AI captions, hashtags, and CTAs from any text or image on the web.',
  permissions: ['contextMenus', 'storage', 'activeTab', 'notifications'],
  host_permissions: [],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'AI Post Assistant (Ctrl+Shift+A)',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
  options_page: 'src/options/index.html',
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+Shift+A',
        mac: 'Command+Shift+A',
      },
      description: 'Open AI Post Assistant popup',
    },
  },
};

export default manifest;
