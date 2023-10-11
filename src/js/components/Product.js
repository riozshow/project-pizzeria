import { templates, select, classNames } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product {
  constructor(id, data) {
    this.id = id;
    this.data = data;

    this.renderInMenu();
    this.getElements();
    this.initAccordion();
    this.initOrderForm();
    this.initAmountWidget();
    this.processOrder();
  }

  renderInMenu() {
    this.dom = {};
    const genreratedHTML = templates.menuProduct(this.data);
    this.dom.wrapper = utils.createDOMFromHTML(genreratedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(this.dom.wrapper);
  }

  getElements() {
    this.dom.accordionTrigger = this.dom.wrapper.querySelector(select.menuProduct.clickable);
    this.dom.form = this.dom.wrapper.querySelector(select.menuProduct.form);
    this.dom.formInputs = this.dom.form.querySelectorAll(select.all.formInputs);
    this.dom.cartButton = this.dom.wrapper.querySelector(select.menuProduct.cartButton);
    this.dom.price = this.dom.wrapper.querySelector(select.menuProduct.priceElem);
    this.dom.imageWrapper = this.dom.wrapper.querySelector(select.menuProduct.imageWrapper);
    this.dom.amountWidget = this.dom.wrapper.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const activeClass = classNames.menuProduct.wrapperActive;
    this.dom.accordionTrigger.addEventListener("click", () => {
      if (this.dom.wrapper.classList.contains(activeClass)) {
        return this.dom.wrapper.classList.remove(activeClass);
      } else {
        [...document.querySelectorAll(".product")].map((product) => product.classList.remove(activeClass));
        this.dom.wrapper.classList.add(activeClass);
      }
    });
  }

  initOrderForm() {
    this.dom.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.processOrder();
    });

    for (let input of this.dom.formInputs) {
      input.addEventListener("change", () => {
        this.processOrder();
      });
    }

    this.dom.cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.processOrder();
      this.addToCart();
    });
  }

  initAmountWidget() {
    this.amountWidget = new AmountWidget(this.dom.amountWidget);
    this.dom.amountWidget.addEventListener("updated", () => {
      this.processOrder();
    });
  }

  processOrder() {
    const { form, imageWrapper } = this.dom;
    let price = this.data.price;
    const formData = utils.serializeFormToObject(form);

    [...imageWrapper.children].map((image) => {
      if (image.classList.length > 1) {
        image.classList.remove(classNames.menuProduct.imageVisible);
      }
    });
    for (const paramId in formData) {
      formData[paramId].map((option) => {
        const image = imageWrapper.querySelector(`.${paramId}-${option}`);
        if (image) {
          image.classList.add(classNames.menuProduct.imageVisible);
        }
      });
    }

    this.productOptions = {};

    for (const paramId in this.data.params) {
      const param = this.data.params[paramId];
      this.productOptions[paramId] = { label: param.label, options: {} };
      for (let optionId in param.options) {
        const option = param.options[optionId];
        if (formData[paramId].includes(optionId)) {
          this.productOptions[paramId].options[optionId] = option.label;
          if (!option.default) {
            price += option.price;
          }
        } else {
          if (option.default) {
            price -= option.price;
          }
        }
      }
    }

    this.priceSingle = price;
    this.price = price * this.amountWidget.value;
    this.dom.price.innerHTML = this.price;
  }

  addToCart() {
    const event = new CustomEvent("add-to-cart", {
      bubbles: true,
      detail: {
        product: this.prepareCartProduct(),
      },
    });
    this.dom.wrapper.dispatchEvent(event);
  }

  prepareCartProduct() {
    const productSummary = {
      id: this.id,
      name: this.data.name,
      amount: this.amountWidget.value,
      price: this.price,
      priceSingle: this.priceSingle,
      params: this.productOptions,
    };
    return productSummary;
  }
}

export default Product;
