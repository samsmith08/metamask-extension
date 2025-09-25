import browser from 'webextension-polyfill';

export function getTabsAPI(): typeof chrome.tabs | typeof browser.tabs {
  if (chrome?.tabs && 'query' in chrome.tabs) {
    return chrome.tabs;
  }

  return browser.tabs;
}
