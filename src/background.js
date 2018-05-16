/*
Copyright 2018 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

(function() {

  const shared = require('./shared');

  const ICON_ENABLED = 'icon-128.png';
  const ICON_DISABLED = 'icon-128-gray.png';
  const STORAGE_KEY = 'pantheonColor';

  const ACTIVE_TABS = {};
  const DATA = {tabId: null, project: null, colors: shared.getColors()};

  // define extension status based on tabs/windows events

  function changeStatus(windowId, tabId, tabURL) {
    ACTIVE_TABS[windowId] = {id: tabId, url: tabURL};
    if (!tabURL) {
      if (tabId !== DATA.tabId)
        DATA.project = setDisabled(tabId);
    } else {
      const url = new URL(tabURL);
      const projectId = url.searchParams.get('project');
      if (projectId)
        DATA.project = setEnabled(tabId, projectId);
      else
        DATA.project = setDisabled(tabId);
    }
    DATA.tabId = tabId;
    chrome.tabs.sendMessage(tabId, {project: DATA.project});
  }

  function setDisabled(tabId) {
    chrome.browserAction.disable();
    chrome.browserAction.setIcon({path: ICON_DISABLED});
    return shared.getProject();
  }

  function setEnabled(tabId, projectId) {
    let project = {};
    project.id = project.name = projectId;
    if (projectId.includes(':'))
      project.name = projectId.split(':')[1];
    project.color = matchColor(project.id);
    chrome.browserAction.enable();
    chrome.browserAction.setIcon({path: ICON_ENABLED});
    return shared.getProject(project);
  }

  // handle color matching and saving

  function matchColor(projectId) {
    return DATA.colors.project[projectId] || null;
  }

  function setColor(objectType, objectId, color) {
    DATA.colors[objectType][objectId] = color;
  }

  function unsetColor(objectType, objectId) {
    if (objectId in DATA.colors[objectType])
      delete DATA.colors[objectType][objectId];
  }

  // listen to relevant tab events

  chrome.tabs.onUpdated.addListener((id, info, tab) => {
    if (info.status !== 'complete')
      return;
    if (tab.active)
      changeStatus(tab.windowId, id, tab.url);
  });

  chrome.tabs.onActivated.addListener(info => {
    chrome.tabs.get(info.tabId, tab => {
      changeStatus(tab.windowId, tab.id, tab.url);
    });
  });

  // listen to relevant windows events

  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId == -1 || !ACTIVE_TABS[windowId])
      return;
    changeStatus(windowId, ACTIVE_TABS[windowId].id, ACTIVE_TABS[windowId].url);
  });

  chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId > -1 && windowId in ACTIVE_TABS)
      delete ACTIVE_TABS[windowId];
  });

  // fetch data from storage

  chrome.storage.sync.get({[STORAGE_KEY]:DATA.colors}, (result) => {
    DATA.colors = result[STORAGE_KEY];
  });

  // handle incoming messages

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == 'query')
      return sendResponse({data: DATA});
    if (request.action !== 'set')
      return console.warn('unkown action', request, sender);
    if (request.type && typeof DATA.colors[request.type] !== 'object')
      return console.warn('Unknown type in request', request);
    if (request.color)
      DATA.colors[request.type][request.id] = request.color;
    else if (!(request.id in DATA.colors[request.type]))
      return console.warn('unset unknown object', request);
    else
      delete DATA.colors[request.type][request.id];
    DATA.project.color = matchColor(request.id);
    chrome.storage.sync.set({[STORAGE_KEY]:DATA.colors});
    if (DATA.tabId)
      chrome.tabs.sendMessage(DATA.tabId, {project: DATA.project});
    sendResponse({data: DATA});
  });

})();
