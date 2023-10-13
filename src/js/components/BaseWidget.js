class BaseWidget {
  constructor(wrapper, initialValue) {
    this.dom = { wrapper };
    this.correctValue = initialValue;
  }

  get value() {
    return this.correctValue;
  }

  set value(value) {
    const newValue = this.parseValue(value);
    if (this.isValid(newValue)) {
      this.correctValue = newValue;
      this.announce();
    }
    this.renderValue();
  }

  setValue(value) {
    this.value = value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(newValue) {
    return !isNaN(newValue);
  }

  renderValue() {
    this.dom.wrapper.innnerHTML = this.value;
  }

  announce() {
    const event = new CustomEvent("updated", { bubbles: true });
    this.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
