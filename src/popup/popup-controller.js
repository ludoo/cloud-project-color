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


module.exports = class {

  static get $inject() {
    return ['MessageService'];
  }

  constructor(messageService) {
    this.messageService = messageService;
    this.swatches = require('../swatches');
    this.activeTab = 'project';
  }

  get project() {
    return this.messageService.project;
  }

  get colors() {
    return this.messageService.colors;
  }

  get hasColor() {
    return this.project.color ? true : false;
  }

  get savedColors() {
    return this.messageService.savedColors;
  }

  get hasSavedColors() {
    return this.savedColors.length > 0;
  }

  set(color) {
    this.messageService.set(this.project.id, color || this.project.color);
  }

  unset(id) {
    this.messageService.set(id || this.project.id);
  }

};