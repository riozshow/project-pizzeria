import { select, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
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
