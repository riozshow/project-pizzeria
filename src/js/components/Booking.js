import { select, settings, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();
  }

  render(wrapper) {
    const genreratedHTML = templates.bookingWidget();
    this.dom = { wrapper };
    this.dom.wrapper.innerHTML =
      utils.createDOMFromHTML(genreratedHTML).innerHTML;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    this.dom.hoursAmount = this.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  async getData() {
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      this.datePicker.minDate
    )}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      this.datePicker.maxDate
    )}`;

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [startDateParam, endDateParam, settings.db.notRepeatParam],
      eventsRepeat: [endDateParam, settings.db.repeatParam],
    };

    const urls = {
      bookings: `${settings.db.url}/${
        settings.db.bookings
      }?${params.bookings.join("&")}`,

      eventsCurrent: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsCurrent.join("&")}`,

      eventsRepeat: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsRepeat.join("&")}`,
    };

    const [bookings, eventsCurrent, eventsRepeat] = await Promise.all([
      utils.fetchJSON(urls.bookings),
      utils.fetchJSON(urls.eventsCurrent),
      utils.fetchJSON(urls.eventsRepeat),
    ]);

    this.parseData(bookings, eventsCurrent, eventsRepeat);
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    bookings.map((event) => this.makeBooked({ ...event }));
    eventsCurrent.map((event) => this.makeBooked({ ...event }));
    eventsRepeat.map((event) => {
      if (event.repeat === "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          this.makeBooked({ ...event, ...{ date: utils.dateToStr(loopDate) } });
        }
      }
    });
  }

  makeBooked({ date, hour, duration, table }) {
    if (!this.booked[date]) {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    const slotsCount = duration / 0.5;

    for (let slot = 0; slot < slotsCount; slot++) {
      const slotId = startHour + slot * 0.5;
      !this.booked[date][slotId]
        ? (this.booked[date][slotId] = [table])
        : this.booked[date][slotId].push(table);
    }
  }

  updateDOM() {}

  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);

    const datePickerWrapper = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    this.datePicker = new DatePicker(datePickerWrapper);

    const hourPickerWrapper = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
    this.hourPicker = new HourPicker(hourPickerWrapper);
  }
}

export default Booking;
