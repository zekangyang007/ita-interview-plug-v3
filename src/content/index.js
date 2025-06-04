import findSelector from '@/lib/findSelector';
import { isXPath, toCamelCase } from '@/utils/helper';
import { sendMessage } from '@/utils/message';
import automa from '@business';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill';
import blocksHandler from './blocksHandler';
import initCommandPalette from './commandPalette';
import initSyncRequirement from './syncRequirement';
import handleSelector, {
  getDocumentCtx,
  queryElements,
} from './handleSelector';
import shortcutListener from './services/shortcutListener';
import showExecutedBlock from './showExecutedBlock';
// import elementObserver from './elementObserver';
import { elementSelectorInstance } from './utils';

const isMainFrame = window.self === window.top;

function messageToFrame(frameElement, blockData) {
  return new Promise((resolve, reject) => {
    function onMessage({ data }) {
      if (data.type !== 'automa:block-execute-result') return;

      if (data.result?.$isError) {
        const error = new Error(data.result.message);
        error.data = data.result.data;

        reject(error);
      } else {
        resolve(data.result);
      }

      window.removeEventListener('message', onMessage);
    }
    window.addEventListener('message', onMessage);

    const messageId = `message:${nanoid(4)}`;
    browser.storage.local.set({ [messageId]: true }).then(() => {
      frameElement.contentWindow.postMessage(
        {
          messageId,
          type: 'automa:execute-block',
          blockData: { ...blockData, frameSelector: '' },
        },
        '*'
      );
    });
  });
}
async function executeBlock(data) {
  const removeExecutedBlock = showExecutedBlock(data, data.executedBlockOnWeb);
  if (data.data?.selector?.includes('|>')) {
    const selectorsArr = data.data.selector.split('|>');
    const selector = selectorsArr.pop();
    const frameSelector = selectorsArr.join('|>');

    const frameElSelector = selectorsArr.pop();

    let findBy = data?.data?.findBy;
    if (!findBy) {
      findBy = isXPath(frameSelector) ? 'xpath' : 'cssSelector';
    }

    const documentCtx = getDocumentCtx(selectorsArr.join('|>'));
    const frameElement = await queryElements(
      {
        findBy,
        multiple: false,
        waitForSelector: 5000,
        selector: frameElSelector,
      },
      documentCtx
    );
    const frameError = (message) => {
      const error = new Error(message);
      error.data = { selector: frameSelector };

      return error;
    };

    if (!frameElement) throw frameError('iframe-not-found');

    const isFrameElement = ['IFRAME', 'FRAME'].includes(frameElement.tagName);
    if (!isFrameElement) throw frameError('not-iframe');

    const { x, y } = frameElement.getBoundingClientRect();
    const iframeDetails = { x, y };

    if (isMainFrame) {
      iframeDetails.windowWidth = window.innerWidth;
      iframeDetails.windowHeight = window.innerHeight;
    }

    data.data.selector = selector;
    data.data.$frameRect = iframeDetails;
    data.data.$frameSelector = frameSelector;

    if (frameElement.contentDocument) {
      data.frameSelector = frameSelector;
    } else {
      const result = await messageToFrame(frameElement, data);
      return result;
    }
  }
  const handlers = blocksHandler();
  const handler = handlers[toCamelCase(data.name || data.label)];
  if (handler) {
    const result = await handler(data, { handleSelector });
    removeExecutedBlock();

    return result;
  }

  const error = new Error(`"${data.label}" doesn't have a handler`);
  console.error(error);

  throw error;
}
async function messageListener({ data, source }) {
  try {
    if (data.type === 'automa:get-frame' && isMainFrame) {
      let frameRect = { x: 0, y: 0 };

      document.querySelectorAll('iframe').forEach((iframe) => {
        if (iframe.contentWindow !== source) return;

        frameRect = iframe.getBoundingClientRect();
      });

      source.postMessage(
        {
          frameRect,
          type: 'automa:the-frame-rect',
        },
        '*'
      );

      return;
    }

    if (data.type === 'automa:execute-block') {
      const messageToken = await browser.storage.local.get(data.messageId);
      if (!data.messageId || !messageToken[data.messageId]) {
        window.top.postMessage(
          {
            result: {
              $isError: true,
              message: 'Block id is empty',
              data: {},
            },
            type: 'automa:block-execute-result',
          },
          '*'
        );
        return;
      }

      await browser.storage.local.remove(data.messageId);

      executeBlock(data.blockData)
        .then((result) => {
          window.top.postMessage(
            {
              result,
              type: 'automa:block-execute-result',
            },
            '*'
          );
        })
        .catch((error) => {
          console.error(error);
          window.top.postMessage(
            {
              result: {
                $isError: true,
                message: error.message,
                data: error.data || {},
              },
              type: 'automa:block-execute-result',
            },
            '*'
          );
        });
    }
  } catch (error) {
    console.error(error);
  }
}

(() => {
  if (window.isAutomaInjected) return;

  initCommandPalette();
  initSyncRequirement();

  let contextElement = null;
  let $ctxLink = '';
  let $ctxMediaUrl = '';
  let $ctxTextSelection = '';

  window.isAutomaInjected = true;
  window.addEventListener('message', messageListener);
  window.addEventListener(
    'contextmenu',
    ({ target }) => {
      contextElement = target;
      $ctxTextSelection = window.getSelection().toString();

      const tag = target.tagName;
      if (tag === 'A') {
        $ctxLink = target.href;
      } else {
        const closestUrl = target.closest('a');
        if (closestUrl) $ctxLink = closestUrl.href;
      }

      const getMediaSrc = (element) => {
        let mediaSrc = element.src || '';

        if (!mediaSrc.src) {
          const sourceEl = element.querySelector('source');
          if (sourceEl) mediaSrc = sourceEl.src;
        }

        return mediaSrc;
      };

      const mediaTags = ['AUDIO', 'VIDEO', 'IMG'];
      if (mediaTags.includes(tag)) {
        $ctxMediaUrl = getMediaSrc(target);
      } else {
        const closestMedia = target.closest('audio,video,img');
        if (closestMedia) $ctxMediaUrl = getMediaSrc(closestMedia);
      }
    },
    true
  );

  window.isAutomaInjected = true;
  window.addEventListener('message', messageListener);
  window.addEventListener('contextmenu', ({ target }) => {
    contextElement = target;
    $ctxTextSelection = window.getSelection().toString();
  });

  if (isMainFrame) {
    shortcutListener();
    // window.addEventListener('load', elementObserver);
  }

  automa('content');

  browser.runtime.onMessage.addListener(async (data) => {
    const asyncExecuteBlock = async (block) => {
      try {
        const res = await executeBlock(block);
        return res;
      } catch (error) {
        console.error(error);
        const elNotFound = error.message === 'element-not-found';
        const isLoopItem = data.data?.selector?.includes('automa-loop');

        if (!elNotFound || !isLoopItem) return Promise.reject(error);

        const findLoopEl = data.loopEls.find(({ url }) =>
          window.location.href.includes(url)
        );

        const blockData = { ...data.data, ...findLoopEl, multiple: true };
        const loopBlock = {
          ...data,
          onlyGenerate: true,
          data: blockData,
        };

        await blocksHandler().loopData(loopBlock);
        return executeBlock(block);
      }
    };

    if (data.isBlock) {
      const res = await asyncExecuteBlock(data);
      return res;
    }

    switch (data.type) {
      case 'input-workflow-params':
        window.initPaletteParams?.(data.data);
        return Boolean(window.initPaletteParams);
      case 'content-script-exists':
        return true;
      case 'automa-element-selector': {
        return elementSelectorInstance();
      }
      case 'context-element': {
        let $ctxElSelector = '';

        if (contextElement) {
          $ctxElSelector = findSelector(contextElement);
          contextElement = null;
        }
        if (!$ctxTextSelection) {
          $ctxTextSelection = window.getSelection().toString();
        }

        const cloneContextData = cloneDeep({
          $ctxLink,
          $ctxMediaUrl,
          $ctxElSelector,
          $ctxTextSelection,
        });

        $ctxLink = '';
        $ctxMediaUrl = '';
        $ctxElSelector = '';
        $ctxTextSelection = '';

        return cloneContextData;
      }
      default:
        return null;
    }
  });
})();

window.addEventListener('__automa-fetch__', (event) => {
  const { id, resource, type } = event.detail;
  const sendResponse = (payload) => {
    window.dispatchEvent(
      new CustomEvent(`__automa-fetch-response-${id}__`, {
        detail: { id, ...payload },
      })
    );
  };

  sendMessage('fetch', { type, resource }, 'background')
    .then((result) => {
      sendResponse({ isError: false, result });
    })
    .catch((error) => {
      sendResponse({ isError: true, result: error.message });
    });
});

window.addEventListener('DOMContentLoaded', async () => {
  const link = window.location.pathname;
  const isAutomaWorkflow = /.+\.automa\.json$/.test(link);
  if (!isAutomaWorkflow) return;

  const accept = window.confirm(
    'Do you want to add this workflow into Automa?'
  );
  if (!accept) return;
  const workflow = JSON.parse(document.documentElement.innerText);

  const { workflows: workflowsStorage } = await browser.storage.local.get(
    'workflows'
  );

  const workflowId = nanoid();
  const workflowData = {
    ...workflow,
    id: workflowId,
    dataColumns: [],
    createdAt: Date.now(),
    table: workflow.table || workflow.dataColumns,
  };

  if (Array.isArray(workflowsStorage)) {
    workflowsStorage.push(workflowData);
  } else {
    workflowsStorage[workflowId] = workflowData;
  }

  await browser.storage.local.set({ workflows: workflowsStorage });

  alert('Workflow installed');
});
