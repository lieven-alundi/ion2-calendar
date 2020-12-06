import { __decorate, __metadata } from "tslib";
import { Component, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, Input, HostBinding, } from '@angular/core';
import { NavParams, ModalController, IonContent } from '@ionic/angular';
import { CalendarService } from '../services/calendar.service';
import * as moment from 'moment';
import { pickModes } from '../config';
const NUM_OF_MONTHS_TO_CREATE = 3;
let CalendarModal = class CalendarModal {
    constructor(_renderer, _elementRef, params, modalCtrl, ref, calSvc) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.params = params;
        this.modalCtrl = modalCtrl;
        this.ref = ref;
        this.calSvc = calSvc;
        this.ionPage = true;
        this.datesTemp = [null, null];
        this._scrollLock = true;
    }
    ngOnInit() {
        this.init();
        this.initDefaultDate();
    }
    ngAfterViewInit() {
        this.findCssClass();
        if (this._d.canBackwardsSelected)
            this.backwardsMonth();
        this.scrollToDefaultDate();
    }
    init() {
        this._d = this.calSvc.safeOpt(this.options);
        this._d.showAdjacentMonthDay = false;
        this.step = this._d.step;
        if (this.step < this.calSvc.DEFAULT_STEP) {
            this.step = this.calSvc.DEFAULT_STEP;
        }
        this.calendarMonths = this.calSvc.createMonthsByPeriod(moment(this._d.from).valueOf(), this.findInitMonthNumber(this._d.defaultScrollTo) + this.step, this._d);
    }
    initDefaultDate() {
        const { pickMode, defaultDate, defaultDateRange, defaultDates } = this._d;
        switch (pickMode) {
            case pickModes.SINGLE:
                if (defaultDate) {
                    this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDate), this._d);
                }
                break;
            case pickModes.RANGE:
                if (defaultDateRange) {
                    if (defaultDateRange.from) {
                        this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.from), this._d);
                    }
                    if (defaultDateRange.to) {
                        this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.to), this._d);
                    }
                }
                break;
            case pickModes.MULTI:
                if (defaultDates && defaultDates.length) {
                    this.datesTemp = defaultDates.map(e => this.calSvc.createCalendarDay(this._getDayTime(e), this._d));
                }
                break;
            default:
                this.datesTemp = [null, null];
        }
    }
    findCssClass() {
        const { cssClass } = this._d;
        if (cssClass) {
            cssClass.split(' ').forEach((_class) => {
                if (_class.trim() !== '')
                    this._renderer.addClass(this._elementRef.nativeElement, _class);
            });
        }
    }
    onChange(data) {
        const { pickMode, autoDone } = this._d;
        this.datesTemp = data;
        this.ref.detectChanges();
        if (pickMode !== pickModes.MULTI && autoDone && this.canDone()) {
            this.done();
        }
        this.repaintDOM();
    }
    onCancel() {
        this.modalCtrl.dismiss(null, 'cancel');
    }
    done() {
        const { pickMode } = this._d;
        this.modalCtrl.dismiss(this.calSvc.wrapResult(this.datesTemp, pickMode), 'done');
    }
    canDone() {
        if (!Array.isArray(this.datesTemp)) {
            return false;
        }
        const { pickMode, defaultEndDateToStartDate } = this._d;
        switch (pickMode) {
            case pickModes.SINGLE:
                return !!(this.datesTemp[0] && this.datesTemp[0].time);
            case pickModes.RANGE:
                if (defaultEndDateToStartDate) {
                    return !!(this.datesTemp[0] && this.datesTemp[0].time);
                }
                return !!(this.datesTemp[0] && this.datesTemp[1]) && !!(this.datesTemp[0].time && this.datesTemp[1].time);
            case pickModes.MULTI:
                return this.datesTemp.length > 0 && this.datesTemp.every(e => !!e && !!e.time);
            default:
                return false;
        }
    }
    clear() {
        this.datesTemp = [null, null];
    }
    canClear() {
        return !!this.datesTemp[0];
    }
    nextMonth(event) {
        const len = this.calendarMonths.length;
        const final = this.calendarMonths[len - 1];
        const nextTime = moment(final.original.time)
            .add(1, 'M')
            .valueOf();
        const rangeEnd = this._d.to ? moment(this._d.to).subtract(1, 'M') : 0;
        if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
            event.target.disabled = true;
            return;
        }
        this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, NUM_OF_MONTHS_TO_CREATE, this._d));
        event.target.complete();
        this.repaintDOM();
    }
    backwardsMonth() {
        const first = this.calendarMonths[0];
        if (first.original.time <= 0) {
            this._d.canBackwardsSelected = false;
            return;
        }
        const firstTime = (this.actualFirstTime = moment(first.original.time)
            .subtract(NUM_OF_MONTHS_TO_CREATE, 'M')
            .valueOf());
        this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, NUM_OF_MONTHS_TO_CREATE, this._d));
        this.ref.detectChanges();
        this.repaintDOM();
    }
    scrollToDate(date) {
        const defaultDateIndex = this.findInitMonthNumber(date);
        const monthElement = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`];
        const domElemReadyWaitTime = 300;
        setTimeout(() => {
            const defaultDateMonth = monthElement ? monthElement.offsetTop : 0;
            if (defaultDateIndex !== -1 && defaultDateMonth !== 0) {
                this.content.scrollByPoint(0, defaultDateMonth, 128);
            }
        }, domElemReadyWaitTime);
    }
    scrollToDefaultDate() {
        this.scrollToDate(this._d.defaultScrollTo);
    }
    onScroll($event) {
        if (!this._d.canBackwardsSelected)
            return;
        const { detail } = $event;
        if (detail.scrollTop <= 200 && detail.velocityY < 0 && this._scrollLock) {
            this.content.getScrollElement().then(scrollElem => {
                this._scrollLock = !1;
                const heightBeforeMonthPrepend = scrollElem.scrollHeight;
                this.backwardsMonth();
                setTimeout(() => {
                    const heightAfterMonthPrepend = scrollElem.scrollHeight;
                    this.content.scrollByPoint(0, heightAfterMonthPrepend - heightBeforeMonthPrepend, 0).then(() => {
                        this._scrollLock = !0;
                    });
                }, 180);
            });
        }
    }
    /**
     * In some older Safari versions (observed at Mac's Safari 10.0), there is an issue where style updates to
     * shadowRoot descendants don't cause a browser repaint.
     * See for more details: https://github.com/Polymer/polymer/issues/4701
     */
    repaintDOM() {
        return this.content.getScrollElement().then(scrollElem => {
            // Update scrollElem to ensure that height of the container changes as Months are appended/prepended
            scrollElem.style.zIndex = '2';
            scrollElem.style.zIndex = 'initial';
            // Update monthsEle to ensure selected state is reflected when tapping on a day
            this.monthsEle.nativeElement.style.zIndex = '2';
            this.monthsEle.nativeElement.style.zIndex = 'initial';
        });
    }
    findInitMonthNumber(date) {
        let startDate = this.actualFirstTime ? moment(this.actualFirstTime) : moment(this._d.from);
        const defaultScrollTo = moment(date);
        const isAfter = defaultScrollTo.isAfter(startDate);
        if (!isAfter)
            return -1;
        if (this.showYearPicker) {
            startDate = moment(new Date(this.year, 0, 1));
        }
        return defaultScrollTo.diff(startDate, 'month');
    }
    _getDayTime(date) {
        return moment(moment(date).format('YYYY-MM-DD')).valueOf();
    }
    _monthFormat(date) {
        return moment(date).format(this._d.monthFormat.replace(/y/g, 'Y'));
    }
    trackByIndex(index, momentDate) {
        return momentDate.original ? momentDate.original.time : index;
    }
};
__decorate([
    ViewChild(IonContent),
    __metadata("design:type", IonContent)
], CalendarModal.prototype, "content", void 0);
__decorate([
    ViewChild('months'),
    __metadata("design:type", ElementRef)
], CalendarModal.prototype, "monthsEle", void 0);
__decorate([
    HostBinding('class.ion-page'),
    __metadata("design:type", Object)
], CalendarModal.prototype, "ionPage", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], CalendarModal.prototype, "options", void 0);
CalendarModal = __decorate([
    Component({
        selector: 'ion-calendar-modal',
        styleUrls: ['./calendar.modal.scss'],
        template: `
    <ion-header>
      <ion-toolbar [color]="_d.color">
          <ion-buttons slot="start">
              <ion-button type='button' slot="icon-only" fill="clear" (click)="onCancel()">
              <span *ngIf="_d.closeLabel !== '' && !_d.closeIcon">{{ _d.closeLabel }}</span>
              <ion-icon *ngIf="_d.closeIcon" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>

          <ion-title>{{ _d.title }}</ion-title>

          <ion-buttons slot="end">
            <ion-button type='button' *ngIf="!!_d.clearLabel" fill="clear" [disabled]="!canClear()" (click)="clear()">
              <span *ngIf="_d.clearLabel !== ''">{{ _d.clearLabel }}</span>
            </ion-button>
            <ion-button type='button' slot="icon-only" *ngIf="!_d.autoDone" fill="clear" [disabled]="!canDone()" (click)="done()">
              <span *ngIf="_d.doneLabel !== '' && !_d.doneIcon">{{ _d.doneLabel }}</span>
              <ion-icon *ngIf="_d.doneIcon" name="checkmark"></ion-icon>
            </ion-button>
          </ion-buttons>
      </ion-toolbar>

      <ng-content select="[sub-header]"></ng-content>

      <ion-calendar-week
        [color]="_d.color"
        [weekArray]="_d.weekdays"
        [weekStart]="_d.weekStart">
      </ion-calendar-week>

    </ion-header>

    <ion-content (ionScroll)="onScroll($event)" class="calendar-page" [scrollEvents]="true"
                 [ngClass]="{'multi-selection': _d.pickMode === 'multi'}">

      <div #months>
        <ng-template ngFor let-month [ngForOf]="calendarMonths" [ngForTrackBy]="trackByIndex" let-i="index">
          <div class="month-box" [attr.id]="'month-' + i">
            <h4 class="text-center month-title">{{ _monthFormat(month.original.date) }}</h4>
            <ion-calendar-month [month]="month"
                                [pickMode]="_d.pickMode"
                                [isSaveHistory]="_d.isSaveHistory"
                                [id]="_d.id"
                                [color]="_d.color"
                                (change)="onChange($event)"
                                [(ngModel)]="datesTemp">
            </ion-calendar-month>
          </div>
        </ng-template>

      </div>

      <ion-infinite-scroll threshold="25%" (ionInfinite)="nextMonth($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>

    </ion-content>
  `,
    }),
    __metadata("design:paramtypes", [Renderer2,
        ElementRef,
        NavParams,
        ModalController,
        ChangeDetectorRef,
        CalendarService])
], CalendarModal);
export { CalendarModal };
//# sourceMappingURL=calendar.modal.js.map