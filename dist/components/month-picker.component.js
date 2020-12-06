import { __decorate, __metadata } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarMonth } from '../calendar.model';
import { defaults } from '../config';
let MonthPickerComponent = class MonthPickerComponent {
    constructor() {
        this.color = defaults.COLOR;
        this.select = new EventEmitter();
        this._thisMonth = new Date();
        this._monthFormat = defaults.MONTH_FORMAT;
        this.MONTH_FORMAT = 'MMMM';
    }
    set monthFormat(value) {
        if (Array.isArray(value) && value.length === 12) {
            this._monthFormat = value;
        }
    }
    get monthFormat() {
        return this._monthFormat;
    }
    _onSelect(month) {
        this.select.emit(month);
    }
    getDate(month) {
        return new Date(this._thisMonth.getFullYear(), month, 1);
    }
};
__decorate([
    Input(),
    __metadata("design:type", CalendarMonth)
], MonthPickerComponent.prototype, "month", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], MonthPickerComponent.prototype, "color", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], MonthPickerComponent.prototype, "select", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array),
    __metadata("design:paramtypes", [Array])
], MonthPickerComponent.prototype, "monthFormat", null);
MonthPickerComponent = __decorate([
    Component({
        selector: 'ion-calendar-month-picker',
        styleUrls: ['./month-picker.component.scss'],
        template: `
    <div [class]="'month-picker ' + color">
      <div class="month-packer-item"
           [class.this-month]=" i === _thisMonth.getMonth() && month.original.year === _thisMonth.getFullYear()"
           *ngFor="let item of _monthFormat; let i = index">
        <button type="button" (click)="_onSelect(i)" [attr.aria-label]="getDate(i) | date:MONTH_FORMAT">{{ item }}</button>
      </div>
    </div>
  `,
    }),
    __metadata("design:paramtypes", [])
], MonthPickerComponent);
export { MonthPickerComponent };
//# sourceMappingURL=month-picker.component.js.map