import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarModal } from './components/calendar.modal';
import { CalendarService } from './services/calendar.service';
export class CalendarController {
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
}
CalendarController.decorators = [
    { type: Injectable }
];
CalendarController.ctorParameters = () => [
    { type: ModalController },
    { type: CalendarService }
];
//# sourceMappingURL=calendar.controller.js.map