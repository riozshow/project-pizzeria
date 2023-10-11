import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct {
  constructor(menuProduct, element) {
    Object.assign(this, menuProduct);
    this.getElements(element);
    this.initAmountWidget();
    this.initActions();
  }

  getElements(element) {
    this.dom = { wrapper: element };
    const elements = {
      amountWidget: this.dom.wrapper.querySelector(select.cartProduct.amountWidget),
      price: this.dom.wrapper.querySelector(select.cartProduct.price),
      edit: this.dom.wrapper.querySelector(select.cartProduct.edit),
      remove: this.dom.wrapper.querySelector(select.cartProduct.remove),
    };
    Object.assign(this.dom, elements);
  }

  getData() {
    return {
      id: this.id,
      name: this.name,
      amount: this.amount,
      params: this.params,
      price: this.price,
    };
  }

  initActions() {
    this.dom.remove.addEventListener("click", () => {
      this.remove();
    });

    this.dom.edit.addEventListener("click", () => {
      this.edit();
    });
  }

  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.amountWidget.setValue(this.amount);
    this.dom.amountWidget.addEventListener("updated", () => {
      this.amount = this.amountWidget.value;
      this.price = this.priceSingle * this.amount;

      this.dom.price.innerHTML = this.price;
    });
  }

  remove() {
    const event = new CustomEvent("remove", {
      bubbles: true,
      detail: {
        cartProduct: this,
      },
    });
    this.dom.wrapper.dispatchEvent(event);
    this.dom.wrapper.remove();
  }

  edit() {}
}

export default CartProduct;
