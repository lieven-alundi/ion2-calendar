import { Component, Input } from '@angular/core';
import { defaults } from '../config';
export class CalendarWeekComponent {
    constructor() {
        this._weekArray = defaults.WEEKS_FORMAT;
        this._displayWeekArray = this._weekArray;
        this._weekStart = 0;
        this.color = defaults.COLOR;
    }
    set weekArray(value) {
        if (value && value.length === 7) {
            this._weekArray = [...value];
            this.adjustSort();
        }
    }
    set weekStart(value) {
        if (value === 0 || value === 1) {
            this._weekStart = value;
            this.adjustSort();
        }
    }
    adjustSort() {
        if (this._weekStart === 1) {
            const cacheWeekArray = [...this._weekArray];
            cacheWeekArray.push(cacheWeekArray.shift());
            this._displayWeekArray = [...cacheWeekArray];
        }
        else if (this._weekStart === 0) {
            this._displayWeekArray = [...this._weekArray];
        }
    }
}
CalendarWeekComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar-week',
                template: `
    <ion-toolbar [class]="'week-toolbar ' + color" no-border-top>
      <ul [class]="'week-title ' + color">
        <li *ngFor="let w of _displayWeekArray">{{ w }}</li>
      </ul>
    </ion-toolbar>
  `,
                styles: [":host .toolbar-background-md,\n:host .toolbar-background-ios {\n  background: transparent; }\n\n:host .week-toolbar {\n  --padding-start: 0;\n  --padding-end: 0;\n  --padding-bottom: 0;\n  --padding-top: 0; }\n  :host .week-toolbar.primary {\n    --background: var(--ion-color-primary); }\n  :host .week-toolbar.secondary {\n    --background: var(--ion-color-secondary); }\n  :host .week-toolbar.danger {\n    --background: var(--ion-color-danger); }\n  :host .week-toolbar.dark {\n    --background: var(--ion-color-dark); }\n  :host .week-toolbar.light {\n    --background: var(--ion-color-light); }\n  :host .week-toolbar.transparent {\n    --background: transparent; }\n  :host .week-toolbar.toolbar-md {\n    min-height: 44px; }\n\n:host .week-title {\n  margin: 0;\n  height: 44px;\n  width: 100%;\n  padding: 15px 0;\n  color: #fff;\n  font-size: 0.9em; }\n  :host .week-title.light, :host .week-title.transparent {\n    color: #9e9e9e; }\n  :host .week-title li {\n    list-style-type: none;\n    display: block;\n    float: left;\n    width: 14%;\n    text-align: center; }\n  :host .week-title li:nth-of-type(7n),\n  :host .week-title li:nth-of-type(7n + 1) {\n    width: 15%; }\n"]
            },] }
];
CalendarWeekComponent.ctorParameters = () => [];
CalendarWeekComponent.propDecorators = {
    color: [{ type: Input }],
    weekArray: [{ type: Input }],
    weekStart: [{ type: Input }]
};
//# sourceMappingURL=calendar-week.component.js.map