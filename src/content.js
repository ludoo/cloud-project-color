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

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const SELECTORS = ['platform-bar-left', '#pcc-purview-switcher'];

  function setProjectColor(project, retryCount=0) {

    if (retryCount >= MAX_RETRIES)
      return console.warn('Maximum retries reached.');

    let parent = SELECTORS.reduce((result, selector) => {
      if (!result)
        result = document.querySelector(selector);
      return result;
    }, null);

    if (!parent)
      return setTimeout(setProjectColor, RETRY_DELAY, project, retryCount + 1);

    let elements = Array.from(parent.childNodes)
      .filter(n => n.nodeType == 1 && n.tagName.endsWith('SWITCHER'));

    if (elements.length == 0)
      return setTimeout(setProjectColor, RETRY_DELAY, project, retryCount + 1);

    let el = elements[0];
    if (!el)
      return;

    el.style.backgroundColor = project.color || 'unset';
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('project' in request)
      setProjectColor(request.project);
  });

})();
