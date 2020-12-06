import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarModal } from './components/calendar.modal';
import { CalendarService } from './services/calendar.service';
let CalendarController = class CalendarController {
    constructor(modalCtrl, calSvc) {
        this.modalCtrl = modalCtrl;
        this.calSvc = calSvc;
    }
    /**
     * @deprecated
     * @param {CalendarModalOptions} calendarOptions
     * @param {ModalOptions} modalOptions
     * @returns {any}
     */
    openCalendar(calendarOptions, modalOptions = {}) {
        const options = this.calSvc.safeOpt(calendarOptions);
        return this.modalCtrl
            .create(Object.assign({ component: CalendarModal, componentProps: {
                options,
            } }, modalOptions))
            .then((calendarModal) => {
            calendarModal.present();
            return calendarModal.onDidDismiss().then((event) => {
                return event.data ? Promise.resolve(event.data) : Promise.reject('cancelled');
            });
        });
    }
};
CalendarController = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ModalController, CalendarService])
], CalendarController);
export { CalendarController };
//# sourceMappingURL=calendar.controller.js.map