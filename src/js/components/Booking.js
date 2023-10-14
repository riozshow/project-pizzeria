import { select, settings, templates, classNames } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

const SLOT_DURATION = 0.5;

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.initWrapperClick();
    this.initTextInputs();
    this.initSubmit();
    this.getData().then(() => this.updateBooking());
  }

  render(wrapper) {
    const genreratedHTML = templates.bookingWidget();
    this.dom = { wrapper };
    this.dom.wrapper.innerHTML = utils.createDOMFromHTML(genreratedHTML).innerHTML;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.tables = [...this.dom.wrapper.querySelectorAll(select.booking.tables)];
    this.dom.form = this.dom.wrapper.querySelector(select.booking.bookingForm);
  }

  async getData() {
    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(this.datePicker.minDate)}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(this.datePicker.maxDate)}`;

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [startDateParam, endDateParam, settings.db.notRepeatParam],
      eventsRepeat: [endDateParam, settings.db.repeatParam],
    };

    const urls = {
      bookings: `${settings.db.url}/${settings.db.bookings}?${params.bookings.join("&")}`,
      eventsCurrent: `${settings.db.url}/${settings.db.events}?${params.eventsCurrent.join("&")}`,
      eventsRepeat: `${settings.db.url}/${settings.db.events}?${params.eventsRepeat.join("&")}`,
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
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
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
    const slotsCount = duration / SLOT_DURATION;

    for (let slot = 0; slot < slotsCount; slot++) {
      const slotId = startHour + slot * SLOT_DURATION;
      !this.booked[date][slotId] ? (this.booked[date][slotId] = [table]) : this.booked[date][slotId].push(table);
    }
  }

  updateDOM() {
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    let bookedTables = [];
    const endTime = this.hour + this.hoursAmount.value;

    for (let currentTime = this.hour; currentTime <= endTime; currentTime += SLOT_DURATION) {
      bookedTables = [...(this.booked[this.date][currentTime] || []), ...bookedTables];
      this.dom.tables.map((table) => {
        const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
        table.classList.toggle(classNames.booking.tableBooked, bookedTables.includes(tableId));
        table.classList.toggle(classNames.booking.tableSelected, this.bookingDetails.table == tableId);
      });
    }
  }

  updateBooking(details = this.getBookingDefaults()) {
    this.bookingDetails = { ...this.bookingDetails, ...details };
    this.updateDOM();
    console.log(this.bookingDetails);
  }

  getBookingDefaults() {
    return {
      date: this.datePicker.value,
      hour: this.hourPicker.value,
      table: null,
      duration: this.hoursAmount.value,
      ppl: this.peopleAmount.value,
      starters: [],
      phone: "",
      address: "",
    };
  }

  initWidgets() {
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.dom.hoursAmount.addEventListener("updated", () => {
      this.updateBooking({ duration: this.hoursAmount.value });
    });

    const datePickerWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    this.datePicker = new DatePicker(datePickerWrapper);
    datePickerWrapper.addEventListener("updated", () => {
      this.updateBooking({ date: this.datePicker.value });
    });

    const hourPickerWrapper = document.querySelector(select.widgets.hourPicker.wrapper);
    this.hourPicker = new HourPicker(hourPickerWrapper);
    hourPickerWrapper.addEventListener("updated", () => {
      this.updateBooking({ hour: this.hourPicker.value });
    });
  }

  initTextInputs() {
    this.dom.wrapper.addEventListener("keydown", (e) => {
      const isBookingForm = settings.booking.inputNames.includes(e.target.name);
      if (isBookingForm) {
        const input = e.target;
        const fieldName = e.target.name;
        this.updateBooking({ [fieldName]: input.value });
      }
    });
  }

  initWrapperClick() {
    this.dom.wrapper.addEventListener("click", (e) => {
      this.selectTable(e);
      this.selectStarter(e);
    });
  }

  selectTable(event) {
    const tableId = event.target.getAttribute(settings.booking.tableIdAttribute);
    if (tableId) {
      const table = event.target;
      if (!table.classList.contains(classNames.booking.tableBooked)) {
        this.bookingDetails.table == tableId
          ? this.updateBooking({ table: null })
          : this.updateBooking({ table: parseInt(tableId) });
      }
    }
  }

  selectStarter(event) {
    const isStarter = event.target.name == settings.booking.starterAttribute;
    if (isStarter) {
      const checkbox = event.target;
      const value = checkbox.value;
      checkbox.checked && !this.bookingDetails.starters.includes(value)
        ? this.updateBooking({ starters: [...this.bookingDetails.starters, value] })
        : this.updateBooking({ starters: this.bookingDetails.starters.filter((starter) => starter != value) });
    }
  }

  initSubmit() {
    this.dom.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = `${settings.db.url}/${settings.db.bookings}`;
      fetch(url, {
        method: "POST",
        body: JSON.stringify(this.bookingDetails),
      }).then(() => {
        this.makeBooked(this.bookingDetails);
        this.updateBooking();
        this.updateDOM();
      });
    });
  }
}

export default Booking;
