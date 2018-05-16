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

const shared = require('../shared');

module.exports = class MessageService {

  static get $inject() {
    return ['$rootScope'];
  }

  constructor($rootScope) {
    this.$rootScope = $rootScope;
    this.project = shared.getProject();
    this.colors = shared.getColors();
    this.savedColors = [];
    chrome.runtime.sendMessage(
      {'action': 'query'},
      resp => this._parseResponse(resp)
    );
  }

  set(id, color, type='project') {
    chrome.runtime.sendMessage(
      {action: 'set', id: id, color: color || null, type: type},
      resp => this._parseResponse(resp)
    );
  }

  _parseResponse(resp) {
    if (!resp || !resp.data || !resp.data.project || !resp.data.colors)
      return console.error('Incorrect response format', resp);
    this.$rootScope.$apply(() => {
      for (let k in this.project) {
        this.project[k] = resp.data.project[k] || null;
      }
      this.savedColors.splice(0, this.savedColors.length);
      for (let k in this.colors) {
        this.colors[k] = resp.data.colors[k] || {};
        for (let n in this.colors[k]) {
          this.savedColors.push({type: k, id: n, color: this.colors[k][n]});
        }
      }
    });
  }

};