var CalendarModule_1;
import { __decorate } from "tslib";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { CalendarController } from './calendar.controller';
import { DEFAULT_CALENDAR_OPTIONS } from './services/calendar-options.provider';
import { CalendarService } from './services/calendar.service';
import { CALENDAR_COMPONENTS } from './components';
export function calendarController(modalCtrl, calSvc) {
    return new CalendarController(modalCtrl, calSvc);
}
let CalendarModule = CalendarModule_1 = class CalendarModule {
    static forRoot(defaultOptions = {}) {
        return {
            ngModule: CalendarModule_1,
            providers: [
                { provide: DEFAULT_CALENDAR_OPTIONS, useValue: defaultOptions }
            ]
        };
    }
};
CalendarModule = CalendarModule_1 = __decorate([
    NgModule({
        imports: [CommonModule, IonicModule, FormsModule],
        declarations: CALENDAR_COMPONENTS,
        exports: CALENDAR_COMPONENTS,
        entryComponents: CALENDAR_COMPONENTS,
        providers: [
            CalendarService,
            {
                provide: CalendarController,
                useFactory: calendarController,
                deps: [ModalController, CalendarService],
            },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
], CalendarModule);
export { CalendarModule };
//# sourceMappingURL=calendar.module.js.map