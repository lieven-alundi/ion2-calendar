import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { defaults } from '../config';
let CalendarWeekComponent = class CalendarWeekComponent {
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
};
__decorate([
    Input(),
    __metadata("design:type", String)
], CalendarWeekComponent.prototype, "color", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [Array])
], CalendarWeekComponent.prototype, "weekArray", null);
__decorate([
    Input(),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], CalendarWeekComponent.prototype, "weekStart", null);
CalendarWeekComponent = __decorate([
    Component({
        selector: 'ion-calendar-week',
        styleUrls: ['./calendar-week.component.scss'],
        template: `
    <ion-toolbar [class]="'week-toolbar ' + color" no-border-top>
      <ul [class]="'week-title ' + color">
        <li *ngFor="let w of _displayWeekArray">{{ w }}</li>
      </ul>
    </ion-toolbar>
  `,
    }),
    __metadata("design:paramtypes", [])
], CalendarWeekComponent);
export { CalendarWeekComponent };
//# sourceMappingURL=calendar-week.component.js.map