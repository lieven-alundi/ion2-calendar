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
export class CalendarModule {
    static forRoot(defaultOptions = {}) {
        return {
            ngModule: CalendarModule,
            providers: [
                { provide: DEFAULT_CALENDAR_OPTIONS, useValue: defaultOptions }
            ]
        };
    }
}
CalendarModule.decorators = [
    { type: NgModule, args: [{
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
            },] }
];
//# sourceMappingURL=calendar.module.js.map