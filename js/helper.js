/**
 * * Product Class
 * @description The class is Built as an easy way to create a product.
 *
 * @param { id, product_name, product_price, product_image, added_to_cart }
 *
 * @returns return a product object.
 */

class Product {
  constructor({
    id,
    product_name,
    product_price,
    product_image,
    added_to_cart,
  }) {
    this.id = id;
    this.product_name = product_name;
    this.product_price = product_price;
    this.product_image = product_image;
    this.added_to_cart = added_to_cart;
  }
}

/**
 * * Modal Class
 * @description The class is Built to handle the modal template.
 *
 * @param new Product
 *
 * @returns Modal displaying the selected product.
 */

class Modal {
  constructor(product) {
    this.$modalImg = document.getElementById("modal_img");
    this.$modalTitle = document.getElementById("modal_title");
    this.$modalPrice = document.getElementById("modal_price");
    this.$modalCartAction = document.querySelector("#dialogBox #cart_action");

    this.render(product);
  }

  render({ id, product_name, product_price, product_image, added_to_cart }) {
    this.$modalImg.src = product_image;
    this.$modalTitle.innerText = product_name;
    this.$modalPrice.innerText = `$${product_price}`;
    this.$modalCartAction.setAttribute("data-productId", id);
    this.$modalCartAction.src = `${
      added_to_cart ? "./assets/remove-cart.svg" : "./assets/add-cart.svg"
    }`;
  }
}

/**
 *
 * @description This function is used to check if the browser is allowed to use the localStorage or not.
 *
 * @param type === localStorage
 *
 * @returns boolean
 */

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

export { Product, Modal, storageAvailable };
