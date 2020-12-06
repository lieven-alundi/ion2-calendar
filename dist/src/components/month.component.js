import { Component, ChangeDetectorRef, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarMonth } from '../calendar.model';
import { defaults, pickModes } from '../config';
export const MONTH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthComponent),
    multi: true,
};
export class MonthComponent {
    constructor(ref) {
        this.ref = ref;
        this.componentMode = false;
        this.readonly = false;
        this.color = defaults.COLOR;
        this.change = new EventEmitter();
        this.select = new EventEmitter();
        this.selectStart = new EventEmitter();
        this.selectEnd = new EventEmitter();
        this._date = [null, null];
        this._isInit = false;
        this.DAY_DATE_FORMAT = 'MMMM dd, yyyy';
    }
    get _isRange() {
        return this.pickMode === pickModes.RANGE;
    }
    ngAfterViewInit() {
        this._isInit = true;
    }
    get value() {
        return this._date;
    }
    writeValue(obj) {
        if (Array.isArray(obj)) {
            this._date = obj;
        }
    }
    registerOnChange(fn) {
        this._onChanged = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    trackByTime(index, item) {
        return item ? item.time : index;
    }
    isEndSelection(day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit || this._date[1] === null) {
            return false;
        }
        return this._date[1].time === day.time;
    }
    getDayLabel(day) {
        return new Date(day.time);
    }
    isBetween(day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit) {
            return false;
        }
        if (this._date[0] === null || this._date[1] === null) {
            return false;
        }
        const start = this._date[0].time;
        const end = this._date[1].time;
        return day.time < end && day.time > start;
    }
    isStartSelection(day) {
        if (!day)
            return false;
        if (this.pickMode !== pickModes.RANGE || !this._isInit || this._date[0] === null) {
            return false;
        }
        return this._date[0].time === day.time && this._date[1] !== null;
    }
    isSelected(time) {
        if (Array.isArray(this._date)) {
            if (this.pickMode !== pickModes.MULTI) {
                if (this._date[0] !== null) {
                    return time === this._date[0].time;
                }
                if (this._date[1] !== null) {
                    return time === this._date[1].time;
                }
            }
            else {
                return this._date.findIndex(e => e !== null && e.time === time) !== -1;
            }
        }
        else {
            return false;
        }
    }
    onSelected(item) {
        if (this.readonly)
            return;
        item.selected = true;
        this.select.emit(item);
        if (this.pickMode === pickModes.SINGLE) {
            this._date[0] = item;
            this.change.emit(this._date);
            return;
        }
        if (this.pickMode === pickModes.RANGE) {
            if (this._date[0] === null) {
                this._date[0] = item;
                this.selectStart.emit(item);
            }
            else if (this._date[1] === null) {
                if (this._date[0].time < item.time) {
                    this._date[1] = item;
                    this.selectEnd.emit(item);
                }
                else {
                    this._date[1] = this._date[0];
                    this.selectEnd.emit(this._date[0]);
                    this._date[0] = item;
                    this.selectStart.emit(item);
                }
            }
            else if (this._date[0].time > item.time) {
                this._date[0] = item;
                this.selectStart.emit(item);
            }
            else if (this._date[1].time < item.time) {
                this._date[1] = item;
                this.selectEnd.emit(item);
            }
            else {
                this._date[0] = item;
                this.selectStart.emit(item);
                this._date[1] = null;
            }
            this.change.emit(this._date);
            return;
        }
        if (this.pickMode === pickModes.MULTI) {
            const index = this._date.findIndex(e => e !== null && e.time === item.time);
            if (index === -1) {
                this._date.push(item);
            }
            else {
                this._date.splice(index, 1);
            }
            this.change.emit(this._date.filter(e => e !== null));
        }
    }
}
MonthComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-calendar-month',
                providers: [MONTH_VALUE_ACCESSOR],
                // tslint:disable-next-line:use-host-property-decorator
                host: {
                    '[class.component-mode]': 'componentMode'
                },
                template: `
    <div [class]="color">
      <ng-template [ngIf]="!_isRange" [ngIfElse]="rangeBox">
        <div class="days-box">
          <ng-template ngFor let-day [ngForOf]="month.days" [ngForTrackBy]="trackByTime">
            <div class="days">
              <ng-container *ngIf="day">
                <button type='button'
                        [class]="'days-btn ' + day.cssClass"
                        [class.today]="day.isToday"
                        (click)="onSelected(day)"
                        [class.marked]="day.marked"
                        [class.last-month-day]="day.isLastMonth"
                        [class.next-month-day]="day.isNextMonth"
                        [class.on-selected]="isSelected(day.time)"
                        [disabled]="day.disable"
                        [attr.aria-label]="getDayLabel(day) | date:DAY_DATE_FORMAT">
                  <p>{{ day.title }}</p>
                  <small *ngIf="day.subTitle">{{ day?.subTitle }}</small>
                </button>
              </ng-container>
            </div>
          </ng-template>
        </div>
      </ng-template>

      <ng-template #rangeBox>
        <div class="days-box">
          <ng-template ngFor let-day [ngForOf]="month.days" [ngForTrackBy]="trackByTime">
            <div class="days"
                 [class.startSelection]="isStartSelection(day)"
                 [class.endSelection]="isEndSelection(day)"
                 [class.is-first-wrap]="day?.isFirst"
                 [class.is-last-wrap]="day?.isLast"
                 [class.between]="isBetween(day)">
              <ng-container *ngIf="day">
                <button type='button'
                        [class]="'days-btn ' + day.cssClass"
                        [class.today]="day.isToday"
                        (click)="onSelected(day)"
                        [class.marked]="day.marked"
                        [class.last-month-day]="day.isLastMonth"
                        [class.next-month-day]="day.isNextMonth"
                        [class.is-first]="day.isFirst"
                        [class.is-last]="day.isLast"
                        [class.on-selected]="isSelected(day.time)"
                        [disabled]="day.disable">
                  <p>{{ day.title }}</p>
                  <small *ngIf="day.subTitle">{{ day?.subTitle }}</small>
                </button>
              </ng-container>

            </div>
          </ng-template>
        </div>
      </ng-template>
    </div>
  `,
                styles: [":host {\n  display: inline-block;\n  width: 100%; }\n  :host .days-box {\n    padding: 0.5rem; }\n  :host .days:nth-of-type(7n),\n  :host .days:nth-of-type(7n + 1) {\n    width: 15%; }\n  :host .days {\n    width: 14%;\n    float: left;\n    text-align: center;\n    height: 36px;\n    margin-bottom: 5px; }\n  :host .days .marked p {\n    font-weight: 500; }\n  :host .days .on-selected {\n    border: none; }\n    :host .days .on-selected p {\n      font-size: 1.3em; }\n  :host .primary button.days-btn small,\n  :host .primary .days .marked p,\n  :host .primary .days .today p {\n    color: var(--ion-color-primary); }\n  :host .primary .days .today p {\n    font-weight: 700; }\n  :host .primary .days .last-month-day p,\n  :host .primary .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .primary .days .today.on-selected p,\n  :host .primary .days .marked.on-selected p {\n    color: #fff; }\n  :host .primary .days .on-selected,\n  :host .primary .startSelection button.days-btn,\n  :host .primary .endSelection button.days-btn {\n    background-color: var(--ion-color-primary);\n    color: #fff; }\n  :host .primary .startSelection {\n    position: relative; }\n    :host .primary .startSelection:before, :host .primary .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .primary .startSelection:before {\n      background-color: var(--ion-color-primary); }\n    :host .primary .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .primary .endSelection {\n    position: relative; }\n    :host .primary .endSelection:before, :host .primary .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .primary .endSelection:before {\n      background-color: var(--ion-color-primary); }\n    :host .primary .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .primary .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .primary .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .primary .between button.days-btn {\n    background-color: var(--ion-color-primary);\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .primary .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .primary .between button.days-btn p {\n      color: #fff; }\n  :host .primary .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .primary .endSelection button.days-btn p {\n      color: #fff; }\n  :host .primary .days .on-selected p {\n    color: #fff; }\n  :host .primary .startSelection button.days-btn,\n  :host .primary .endSelection button.days-btn,\n  :host .primary .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .primary .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n  :host .secondary button.days-btn small,\n  :host .secondary .days .marked p,\n  :host .secondary .days .today p {\n    color: var(--ion-color-secondary); }\n  :host .secondary .days .today p {\n    font-weight: 700; }\n  :host .secondary .days .last-month-day p,\n  :host .secondary .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .secondary .days .today.on-selected p,\n  :host .secondary .days .marked.on-selected p {\n    color: #fff; }\n  :host .secondary .days .on-selected,\n  :host .secondary .startSelection button.days-btn,\n  :host .secondary .endSelection button.days-btn {\n    background-color: var(--ion-color-secondary);\n    color: #fff; }\n  :host .secondary .startSelection {\n    position: relative; }\n    :host .secondary .startSelection:before, :host .secondary .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .secondary .startSelection:before {\n      background-color: var(--ion-color-secondary); }\n    :host .secondary .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .secondary .endSelection {\n    position: relative; }\n    :host .secondary .endSelection:before, :host .secondary .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .secondary .endSelection:before {\n      background-color: var(--ion-color-secondary); }\n    :host .secondary .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .secondary .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .secondary .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .secondary .between button.days-btn {\n    background-color: var(--ion-color-secondary);\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .secondary .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .secondary .between button.days-btn p {\n      color: #fff; }\n  :host .secondary .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .secondary .endSelection button.days-btn p {\n      color: #fff; }\n  :host .secondary .days .on-selected p {\n    color: #fff; }\n  :host .secondary .startSelection button.days-btn,\n  :host .secondary .endSelection button.days-btn,\n  :host .secondary .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .secondary .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n  :host .danger button.days-btn small,\n  :host .danger .days .marked p,\n  :host .danger .days .today p {\n    color: var(--ion-color-danger); }\n  :host .danger .days .today p {\n    font-weight: 700; }\n  :host .danger .days .last-month-day p,\n  :host .danger .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .danger .days .today.on-selected p,\n  :host .danger .days .marked.on-selected p {\n    color: #fff; }\n  :host .danger .days .on-selected,\n  :host .danger .startSelection button.days-btn,\n  :host .danger .endSelection button.days-btn {\n    background-color: var(--ion-color-danger);\n    color: #fff; }\n  :host .danger .startSelection {\n    position: relative; }\n    :host .danger .startSelection:before, :host .danger .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .danger .startSelection:before {\n      background-color: var(--ion-color-danger); }\n    :host .danger .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .danger .endSelection {\n    position: relative; }\n    :host .danger .endSelection:before, :host .danger .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .danger .endSelection:before {\n      background-color: var(--ion-color-danger); }\n    :host .danger .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .danger .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .danger .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .danger .between button.days-btn {\n    background-color: var(--ion-color-danger);\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .danger .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .danger .between button.days-btn p {\n      color: #fff; }\n  :host .danger .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .danger .endSelection button.days-btn p {\n      color: #fff; }\n  :host .danger .days .on-selected p {\n    color: #fff; }\n  :host .danger .startSelection button.days-btn,\n  :host .danger .endSelection button.days-btn,\n  :host .danger .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .danger .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n  :host .dark button.days-btn small,\n  :host .dark .days .marked p,\n  :host .dark .days .today p {\n    color: var(--ion-color-dark); }\n  :host .dark .days .today p {\n    font-weight: 700; }\n  :host .dark .days .last-month-day p,\n  :host .dark .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .dark .days .today.on-selected p,\n  :host .dark .days .marked.on-selected p {\n    color: #fff; }\n  :host .dark .days .on-selected,\n  :host .dark .startSelection button.days-btn,\n  :host .dark .endSelection button.days-btn {\n    background-color: var(--ion-color-dark);\n    color: #fff; }\n  :host .dark .startSelection {\n    position: relative; }\n    :host .dark .startSelection:before, :host .dark .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .dark .startSelection:before {\n      background-color: var(--ion-color-dark); }\n    :host .dark .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .dark .endSelection {\n    position: relative; }\n    :host .dark .endSelection:before, :host .dark .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .dark .endSelection:before {\n      background-color: var(--ion-color-dark); }\n    :host .dark .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .dark .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .dark .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .dark .between button.days-btn {\n    background-color: var(--ion-color-dark);\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .dark .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .dark .between button.days-btn p {\n      color: #fff; }\n  :host .dark .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .dark .endSelection button.days-btn p {\n      color: #fff; }\n  :host .dark .days .on-selected p {\n    color: #fff; }\n  :host .dark .startSelection button.days-btn,\n  :host .dark .endSelection button.days-btn,\n  :host .dark .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .dark .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n  :host .light button.days-btn small,\n  :host .light .days .marked p,\n  :host .light .days .today p {\n    color: var(--ion-color-light); }\n  :host .light .days .today p {\n    font-weight: 700; }\n  :host .light .days .last-month-day p,\n  :host .light .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .light .days .today.on-selected p,\n  :host .light .days .marked.on-selected p {\n    color: #a0a0a0; }\n  :host .light .days .on-selected,\n  :host .light .startSelection button.days-btn,\n  :host .light .endSelection button.days-btn {\n    background-color: var(--ion-color-light);\n    color: #a0a0a0; }\n  :host .light .startSelection {\n    position: relative; }\n    :host .light .startSelection:before, :host .light .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .light .startSelection:before {\n      background-color: var(--ion-color-light); }\n    :host .light .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .light .endSelection {\n    position: relative; }\n    :host .light .endSelection:before, :host .light .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .light .endSelection:before {\n      background-color: var(--ion-color-light); }\n    :host .light .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .light .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .light .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .light .between button.days-btn {\n    background-color: var(--ion-color-light);\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .light .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .light .between button.days-btn p {\n      color: #a0a0a0; }\n  :host .light .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .light .endSelection button.days-btn p {\n      color: #a0a0a0; }\n  :host .light .days .on-selected p {\n    color: #a0a0a0; }\n  :host .light .startSelection button.days-btn,\n  :host .light .endSelection button.days-btn,\n  :host .light .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .light .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n  :host .light .days .today p {\n    color: #565656; }\n  :host button.days-btn {\n    border-radius: 36px;\n    width: 36px;\n    display: block;\n    margin: 0 auto;\n    padding: 0;\n    height: 36px;\n    background-color: transparent;\n    position: relative;\n    z-index: 2;\n    outline: 0; }\n  :host button.days-btn p {\n    margin: 0;\n    font-size: 1.2em;\n    color: #333;\n    text-align: center; }\n  :host button.days-btn[disabled] p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host button.days-btn.on-selected small {\n    transition: bottom 0.3s;\n    bottom: -14px; }\n  :host button.days-btn small {\n    overflow: hidden;\n    display: block;\n    left: 0;\n    right: 0;\n    bottom: -5px;\n    position: absolute;\n    z-index: 1;\n    text-align: center;\n    font-weight: 200; }\n  :host .days.startSelection:nth-child(7n):before,\n  :host .days.between:nth-child(7n) button.days-btn,\n  :host .days.between button.days-btn.is-last {\n    border-radius: 0 36px 36px 0; }\n    :host .days.startSelection:nth-child(7n):before.on-selected,\n    :host .days.between:nth-child(7n) button.days-btn.on-selected,\n    :host .days.between button.days-btn.is-last.on-selected {\n      border-radius: 50%; }\n  :host .days.endSelection:nth-child(7n + 1):before,\n  :host .days.between:nth-child(7n + 1) button.days-btn,\n  :host .days.between.is-first-wrap button.days-btn.is-first,\n  :host button.days-btn.is-first {\n    border-radius: 36px 0 0 36px; }\n  :host .startSelection button.days-btn.is-first,\n  :host .endSelection button.days-btn.is-first,\n  :host button.days-btn.is-first.on-selected,\n  :host button.days-btn.is-last.on-selected,\n  :host .startSelection button.days-btn.is-last,\n  :host .endSelection button.days-btn.is-last {\n    border-radius: 50%; }\n  :host .startSelection.is-last-wrap::before, :host .startSelection.is-last-wrap::after {\n    border-radius: 0 36px 36px 0; }\n  :host .endSelection.is-first-wrap::before, :host .endSelection.is-first-wrap::after {\n    border-radius: 36px 0 0 36px; }\n  :host.component-mode .days.between button.days-btn.is-last,\n  :host.component-mode .days.between button.days-btn.is-first {\n    border-radius: 0; }\n  :host.component-mode .days.startSelection.is-last-wrap::before, :host.component-mode .days.startSelection.is-last-wrap::after {\n    border-radius: 0; }\n  :host.component-mode .days.endSelection.is-first-wrap::before, :host.component-mode .days.endSelection.is-first-wrap::after {\n    border-radius: 0; }\n  :host .cal-color .days .today p {\n    font-weight: 700; }\n  :host .cal-color .days .last-month-day p,\n  :host .cal-color .days .next-month-day p {\n    color: rgba(0, 0, 0, 0.25); }\n  :host .cal-color .days .today.on-selected p,\n  :host .cal-color .days .marked.on-selected p {\n    color: #fff; }\n  :host .cal-color .days .on-selected,\n  :host .cal-color .startSelection button.days-btn,\n  :host .cal-color .endSelection button.days-btn {\n    color: #fff; }\n  :host .cal-color .startSelection {\n    position: relative; }\n    :host .cal-color .startSelection:before, :host .cal-color .startSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      right: 0;\n      display: block; }\n    :host .cal-color .startSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .cal-color .endSelection {\n    position: relative; }\n    :host .cal-color .endSelection:before, :host .cal-color .endSelection:after {\n      height: 36px;\n      width: 50%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      display: block; }\n    :host .cal-color .endSelection:after {\n      background-color: white;\n      opacity: 0.25; }\n  :host .cal-color .startSelection.endSelection:after {\n    background-color: transparent; }\n  :host .cal-color .startSelection button.days-btn {\n    border-radius: 50%; }\n  :host .cal-color .between button.days-btn {\n    width: 100%;\n    border-radius: 0;\n    position: relative; }\n    :host .cal-color .between button.days-btn:after {\n      height: 36px;\n      width: 100%;\n      content: '';\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      display: block;\n      background-color: white;\n      opacity: 0.25; }\n    :host .cal-color .between button.days-btn p {\n      color: #fff; }\n  :host .cal-color .endSelection button.days-btn {\n    border-radius: 50%; }\n    :host .cal-color .endSelection button.days-btn p {\n      color: #fff; }\n  :host .cal-color .days .on-selected p {\n    color: #fff; }\n  :host .cal-color .startSelection button.days-btn,\n  :host .cal-color .endSelection button.days-btn,\n  :host .cal-color .between button.days-btn {\n    -webkit-transition-property: background-color;\n    -moz-transition-property: background-color;\n    -ms-transition-property: background-color;\n    -o-transition-property: background-color;\n    transition-property: background-color;\n    -webkit-transition-duration: 180ms;\n    -moz-transition-duration: 180ms;\n    -ms-transition-duration: 180ms;\n    -o-transition-duration: 180ms;\n    transition-duration: 180ms;\n    -webkit-transition-timing-function: ease-out;\n    -moz-transition-timing-function: ease-out;\n    -ms-transition-timing-function: ease-out;\n    -o-transition-timing-function: ease-out;\n    transition-timing-function: ease-out; }\n  :host .cal-color .startSelection.endSelection::before {\n    --ion-color-primary: transparent; }\n"]
            },] }
];
MonthComponent.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
MonthComponent.propDecorators = {
    componentMode: [{ type: Input }],
    month: [{ type: Input }],
    pickMode: [{ type: Input }],
    isSaveHistory: [{ type: Input }],
    id: [{ type: Input }],
    readonly: [{ type: Input }],
    color: [{ type: Input }],
    change: [{ type: Output }],
    select: [{ type: Output }],
    selectStart: [{ type: Output }],
    selectEnd: [{ type: Output }]
};
//# sourceMappingURL=month.component.js.map