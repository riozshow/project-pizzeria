import { settings, select } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    this.getElements();
    this.initActions();
    this.renderValue();
  }

  getElements() {
    this.dom.input = this.dom.wrapper.querySelector(select.widgets.amount.input);
    this.dom.linkDecrease = this.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    this.dom.linkIncrease = this.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  renderValue() {
    this.dom.input.value = this.value;
  }

  isValid(newValue) {
    return (!isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)
}

  initActions() {
    this.dom.input.addEventListener("change", (e) => {
      this.setValue(e.target.value);
    });
    this.dom.linkDecrease.addEventListener("click", () => {
      this.setValue(this.value - 1);
    });
    this.dom.linkIncrease.addEventListener("click", () => {
      this.setValue(this.value + 1);
    });
  }

  
}

export default AmountWidget;
