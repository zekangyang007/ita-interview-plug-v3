import browser from 'webextension-polyfill';
import initApp from './main';
import injectAppStyles from '../injectAppStyles';

function pageLoaded() {
  return new Promise((resolve) => {
    const checkDocState = () => {
      if (document.readyState === 'loading') {
        setTimeout(checkDocState, 1000);
        return;
      }

      resolve();
    };

    checkDocState();
  });
}

export default async function () {
  try {
    const isMainFrame = window.self === window.top;
    if (!isMainFrame) return;

    const isInvalidURL = /.(json|xml)$/.test(window.location.pathname);
    if (isInvalidURL) return;

    const { automaShortcut } = await browser.storage.local.get(
      'automaShortcut'
    );
    if (Array.isArray(automaShortcut) && automaShortcut.length === 0) return;

    await pageLoaded();

    const instanceExist = document.querySelector('ita-sync-requirement112');
    if (instanceExist) return;

    const element = document.createElement('div');
    element.attachShadow({ mode: 'open' });
    element.id = 'ita-sync-requirement112';

    await injectAppStyles(element.shadowRoot);
    initApp(element);

    console.log('element', element);

    document.body.appendChild(element);
  } catch (error) {
    console.error(error);
  }
}
