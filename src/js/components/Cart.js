import { select, classNames, templates, settings } from "../settings.js";
import { utils } from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    this.orderDetails = {};
    this.products = [];
    this.getElements(element);
    this.initActions();
  }

  getElements(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.toggleTrigger = this.dom.wrapper.querySelector(select.cart.toggleTrigger);
    this.dom.productList = this.dom.wrapper.querySelector(select.cart.productList);
    this.dom.deliveryFee = this.dom.wrapper.querySelector(select.cart.deliveryFee);
    this.dom.subtotalPrice = this.dom.wrapper.querySelector(select.cart.subtotalPrice);
    this.dom.totalPrice = this.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    this.dom.totalNumber = this.dom.wrapper.querySelector(select.cart.totalNumber);
    this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
    this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.cart.address);
  }

  initActions() {
    this.dom.toggleTrigger.addEventListener("click", () => {
      this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    this.dom.productList.addEventListener("updated", () => {
      this.update();
    });
    this.dom.productList.addEventListener("remove", (e) => {
      this.products = this.products.filter((product) => product !== e.detail.cartProduct);
      this.update();
    });
    this.dom.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendOrder();
    });
    this.dom.phone.addEventListener("change", (e) => {
      this.orderDetails.phone = e.target.value;
    });
    this.dom.address.addEventListener("change", (e) => {
      this.orderDetails.address = e.target.value;
    });
  }

  add(menuProduct) {
    const genreratedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(genreratedHTML);
    this.dom.productList.appendChild(generatedDOM);
    this.products.push(new CartProduct(menuProduct, generatedDOM));
    this.update();
  }

  update() {
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (const product of this.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    this.totalPrice = subtotalPrice;

    if (totalNumber > 0) {
      this.totalPrice += deliveryFee;
      this.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      this.dom.deliveryFee.innerHTML = 0;
    }

    this.dom.totalNumber.innerHTML = totalNumber;
    [...this.dom.totalPrice].map((elem) => (elem.innerHTML = this.totalPrice));
    this.dom.subtotalPrice.innerHTML = subtotalPrice;

    const details = {
      totalPrice: this.totalPrice,
      subtotalPrice,
      totalNumber,
      deliveryFee,
      products: this.products.map((product) => product.getData()),
    };
    Object.assign(this.orderDetails, details);
  }

  sendOrder() {
    const url = settings.db.url + "/" + settings.db.orders;
    const payload = this.orderDetails;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}

export default Cart;
