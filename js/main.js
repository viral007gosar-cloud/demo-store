import { products } from "../data/products.js";
import { Modal, Product, storageAvailable } from "./helper.js";

/**
 * * Products Class
 * @description The class is Built to control all render process and handle all states change.
 *
 * @param N/A
 *
 * @returns return the product card list.
 */
class Products {
  constructor() {
    this.$virtualDom = document.createDocumentFragment();
    this.$productsContainer = document.querySelector(".products_container");
    this.$cartNumber = document.getElementById("number_holder");
    this.$dialogBoxId = document.getElementById("dialogBox");
    this.$closeDialogHeader = document.getElementById("closeDialogHeader");
    this.$cartList = document.getElementById("cart_list");
    this.isLocalStorageAvailable = false;

    /**
     * ? Check if localStorage available on the browser on not.
     * * If localStorage available then check if not created before then only create a new one to avoid remove the old history for user
     * If there no localStorage available on the user client then we can you temporary option to avoid blank page.
     */

    if (storageAvailable("localStorage")) {
      if (!localStorage.getItem("cart") && !localStorage.getItem("data")) {
        localStorage.setItem("data", JSON.stringify(products));
        localStorage.setItem("cart", JSON.stringify([]));
      }
      this.isLocalStorageAvailable = true;
    } else {
      this.isLocalStorageAvailable = false;
    }
    this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    this.allProducts = JSON.parse(localStorage.getItem("data")) || products;

    this.render();
  }

  /**
   * @param new Product
   *
   * @description Used to add or remove products from the cart.
   *
   * @returns Update the products
   */

  add_to_cart(product) {
    this.isLocalStorageAvailable &&
      localStorage.setItem("cart", JSON.stringify([...this.cart, product]));
    this.cart.push(product);
  }

  delete_from_cart(product) {
    this.cart = this.cart.filter((item) => item.id !== product.id);
    this.isLocalStorageAvailable &&
      localStorage.setItem("cart", JSON.stringify([...this.cart]));
  }

  /**
   * @param id
   *
   * @description used to simplify the process to add or remove from the cart while checking if the product is in or not along with updating the localStorage.
   *
   * @returns function add/remove
   */

  handleCart(id) {
    const selectedProduct = this.allProducts.find(
      (product) => product.id === +id
    );
    const isFound = this.cart.find((item) => item.id === +id);

    if (!isFound) {
      selectedProduct.added_to_cart = true;
      this.add_to_cart(new Product({ ...selectedProduct }));
      this.allProducts.map((item) =>
        item.id === +id ? { ...item, add_to_cart: true } : item
      );
    } else {
      selectedProduct.added_to_cart = false;
      this.delete_from_cart(new Product({ ...selectedProduct }));
      this.allProducts.map((item) =>
        item.id === +id ? { ...item, add_to_cart: false } : item
      );
    }
    localStorage.setItem("data", JSON.stringify(this.allProducts));
    this.createCartList();
    this.$cartNumber.innerText = this.cart.length;
  }

  /**
   * @param event
   *
   * @description used to show and hide the modal with the selected product and keep the product updated with its status of add/remove from the cart.
   *
   * @returns render a Modal
   */

  showDialog(e) {
    const targetEleId = e.target.getAttribute("data-productId");
    const selectedProduct = this.allProducts.find(
      (product) => product.id === +targetEleId
    );
    new Modal({ ...selectedProduct });

    // prevent close the modal when click Esc button.
    this.$dialogBoxId.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    });
    this.$dialogBoxId.showModal();

    this.$closeDialogHeader.addEventListener("click", () =>
      this.$dialogBoxId.close()
    );
  }

  /**
   * @param N/A
   *
   * @description used to add an event listener for all products card actions buttons such as add/remove from cart, and view the modal.
   *
   * @returns N/A
   */

  addListener() {
    const allImages = document.querySelectorAll("#cart_action");
    allImages.forEach((image) => {
      image.addEventListener("click", (e) => {
        this.handleCart(image.getAttribute("data-productId"));
        this.updateState(image.getAttribute("data-productId"));
      });
    });
    const viewImages = document.querySelectorAll("#view_product");
    viewImages.forEach((view) => {
      view.addEventListener("click", (e) => this.showDialog(e));
    });
  }

  /**
   * @param id
   *
   * @description Following the state and updating the icons according to the status.
   *
   * @returns N/A
   */

  updateState(id) {
    const targetEles = document.querySelectorAll(
      `#cart_action[data-productId="${id}"]`
    );
    targetEles.forEach((el) => {
      if (el.src.includes("add-cart.svg")) {
        el.src = "./assets/remove-cart.svg";
      } else {
        el.src = "./assets/add-cart.svg";
      }
    });
  }

  /**
   * @param N/A
   *
   * @description Should render the dropdown products card list which contains all products added to the cart.
   *
   * @returns render product list inside the dropdown.
   */

  createCartList() {
    this.$cartList.innerHTML = "";
    if (this.cart.length) {
      this.cart.forEach(
        ({ id, product_name, product_price, product_image }) => {
          const cardDiv = document.createElement("div");
          cardDiv.classList.add("cart_product_card");

          const listTemplate = `<div class="cart_product_card_img">
                      <img src="${product_image}" alt="product" />
                    </div>
                    <div class="cart_product_card_content">
                      <h3>${product_name}</h3>
                      <p>$${product_price}</p>
                    </div>
                    <div class="cart_remove_product" data-productId="${id}">x</div>`;
          cardDiv.innerHTML = listTemplate;
          this.$virtualDom.appendChild(cardDiv);
        }
      );
    } else {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("cart_product_card");
      cardDiv.innerHTML = `<p>No Products Added</p>`;
      this.$virtualDom.appendChild(cardDiv);
    }
    this.$cartList.appendChild(this.$virtualDom);
    const deleteFromCartBtns = document.querySelectorAll(
      ".cart_remove_product"
    );
    if (deleteFromCartBtns) {
      deleteFromCartBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.handleCart(e.target.getAttribute("data-productId"));
          this.updateState(e.target.getAttribute("data-productId"));
        });
      });
    }
  }

  /**
   * @param N/A
   *
   * @description Should render all products card to the main page and this is the first function called inside the constructor.
   *
   * @returns render product card to the main page.
   */

  render() {
    if (!this.allProducts.length) {
      const productsError = `<div class="products_error"><p>Sorry, an error happened while bringing your products Please use the below button to refresh the page.</p>
      <button onclick={window.location.reload()}>Refresh</button></div>`;
      return (this.$productsContainer.innerHTML = productsError);
    }
    this.allProducts.forEach(
      ({ id, product_name, product_price, product_image, added_to_cart }) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("product_card");

        const product = `<div class="product_card_img">
            <img src="${product_image}" alt="${product_name}" />
          </div>
          <div class="product_card_content">
            <h3>${product_name}</h3>
            <p>$${product_price}</p>
            <div class="icon product_card_actions">
              <img id="cart_action" src=${
                added_to_cart
                  ? "./assets/remove-cart.svg"
                  : "./assets/add-cart.svg"
              } alt="add to cart" data-productId="${id}" />
              <img
                id="view_product"
                src="./assets/view.svg"
                alt="view product"
                data-productId="${id}"
              />
            </div>
          </div>`;

        cardDiv.innerHTML = product;
        this.$virtualDom.appendChild(cardDiv);
      }
    );

    this.$productsContainer.appendChild(this.$virtualDom);
    this.addListener();
    this.$cartNumber.innerText = this.cart.length;
    this.createCartList();
  }
}

new Products();

// Handle dropdown menu open and close
const cartImage = document.getElementById("cart_img");
const cartDropdown = document.getElementById("cart_list");

cartImage.addEventListener("click", (e) => {
  e.stopPropagation();
  if (cartDropdown.classList.contains("hide_cart")) {
    cartDropdown.classList.remove("hide_cart");
    cartDropdown.classList.add("cart_dropdown");
  } else {
    cartDropdown.classList.add("hide_cart");
    cartDropdown.classList.remove("cart_dropdown");
  }
});
cartDropdown.addEventListener("click", (e) => e.stopPropagation());

document.documentElement.addEventListener("click", () => {
  cartDropdown.classList.add("hide_cart");
  cartDropdown.classList.remove("cart_dropdown");
});
