var cartID = localStorage.getItem('cartID') || "NULL";;
// ecommerce.js
$(document).ready(function () {
    var currentUrl = window.location.href;
    updateCartDisplay();
    console.log(cartID);

    $('#filter-button').click(function () {
        var subcategory = $('#subcategory-input').val() || '%';
        var minPrice = $('#min-price-input').val() || 'NULL';
        var maxPrice = $('#max-price-input').val() || 'NULL';
        var sort = $('#sort-input').val() || 'NULL';

        $.ajax({
            url: 'http://172.17.12.44/cse383_final/final.php/getProduct',
            method: 'GET',
            dataType: 'json',
            data: {
                subcategory: subcategory,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sort: sort
            }
        }).done(function (response) {
            if (!Array.isArray(response.result)) {
                alert("No products found.");
                return;
            }

            var quantityDropdown = '<select class="form-control">';
            for (var i = 1; i <= 30; i++) {
                quantityDropdown += '<option value="' + i + '">' + i + '</option>';
            }
            quantityDropdown += '</select>';

            var tableHtml = "";
            response.result.forEach(function (product) {
                tableHtml +=
                    `<tr>
                        <td>${product.title}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>${product.category}</td>
                        <td><img src="${product.image}" alt="${product.title}" style="width: 100px; height: auto;"></td>
                        <td>${product.subcategory}</td>
                        <td>${quantityDropdown}</td>
                        <td><button class="btn btn-primary add-to-cart-button" onclick="addItemToCart(${product.product_id}, this)">Add to Cart</button></td>
                    </tr>`;
            });

            $("#product-table tbody").html(tableHtml);
        }).fail(function (error) {
            console.log("error", error.statusText);
        });
    });

    if (currentUrl.includes("ecommerce.html")) {
        $('#filter-button').click();
    }


    if (currentUrl.includes("cart.html") && cartID !== "NULL") {
        updateCartOverview();
    }

});

function updateCartOverview() {
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/getCartItems',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function (response) {
        if (response.found === 0) {
            var tableHtml = "";
            response.cart.forEach(function (item) {
                var quantityDropdown = '<select class="form-control quantity-select" data-product-id="'
                    + item.product_id + '" onchange="updateCartItemQuantity(\'' + cartID + '\', \''
                    + item.product_id + '\', this.value)">';
                for (var i = 1; i <= 30; i++) {
                    quantityDropdown += `<option value="${i}" ${i == item.Qty ? 'selected' : ''}>${i}</option>`;
                }
                quantityDropdown += '</select>';

                tableHtml += `<tr>
                    <td><img src="${item.image}" alt="${item.title}" style="width: 100px; height: auto;"></td>
                    <td>${item.title}</td>
                    <td>${item.description}</td>
                    <td>${item.subcategory}</td>
                    <td>${quantityDropdown}</td>
                    <td>$${item.price}</td>
                    <td><button class="btn btn-primary remove-items-button" onclick="removeItemFromCart('${cartID}', '${item.product_id}')">Delete</button></td>
                </tr>`;
            });
            $("#product-table tbody").html(tableHtml);
        } else {
            alert("Error loading cart items: " + response.message);
        }
    }).fail(function (error) {
        console.log("Error fetching cart items:", error);
    });
}

function addItemToCart(productID, button) {
    var qty = $(button).closest('tr').find('select').val();
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/addItemToCart',
        method: 'POST',
        dataType: 'json',
        data: {
            cartID: cartID,
            productID: productID,
            qty: qty
        }
    }).done(function (response) {
        if (response.found === 0) {
            if (cartID === "NULL") {
                cartID = response.newCartID;
                localStorage.setItem('cartID', cartID);
            }
            updateCartDisplay();
            alert(response.Qty + " items added to cart successfully!");
        } else {
            alert(response.message);
        }
    }).fail(function (error) {
        console.log("Error adding to cart:", error.statusText);
    });
}

function updateCartDisplay() {
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/getCartDetails',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function (response) {
        if (response.status === 0) {
            $("#item-count").text(response.itemCount);
            $("#total-amount").text(response.totalAmount);
            $("#item-count-2").text(response.itemCount);
            $("#total-amount-2").text("$" + response.totalAmount);
        } else {
            console.log("Error fetching cart details:", response.message);
        }
    }).fail(function (error) {
        console.log("AJAX error fetching cart details:", error.statusText);
    });
}

function removeItemFromCart(cartID, productID) {
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/RemoveitemFromCart',
        method: 'POST',
        dataType: 'json',
        data: {
            cartID: cartID,
            productID: productID
        }
    }).done(function (response) {
        if (response.found === 0) {
            // alert("Item removed from cart successfully!");
            updateCartDisplay();
            updateCartOverview();
        } else {
            alert(response.message);
        }
    }).fail(function (error) {
        console.log("Error removing item from cart:", error.statusText);
    });
}

function updateCartItemQuantity(cartID, productID, newQty) {
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/updateCartItemQuantity',
        method: 'POST',
        dataType: 'json',
        data: {
            cartID: cartID,
            productID: productID,
            newQty: newQty
        }
    }).done(function (response) {
        if (response.status === 0) {
            // alert("Quantity updated successfully!");
            updateCartDisplay();
        } else {
            alert("Error: " + response.message);
        }
    }).fail(function (error) {
        console.log("Error updating quantity:", error.statusText);
    });
}

function updateStateField() {
    var country = document.getElementById("country").value;
    var stateField = document.getElementById("stateField");

    if (country !== "United States") {
        // If the selected country is not the US, switch to a text field
        stateField.innerHTML = '<label for="state" class="form-label">State/Province: <span class="required">*</span></label><input type="text" id="state" name="state" class="form-control" required>';
    } else {
        // If the US is selected, use a dropdown for states
        stateField.innerHTML = '<label for="state" class="form-label">State <span class="required">*</span></label>' + '<select id="state" name="state" class="form-control">'
            + '<option value="AL">Alabama</option>'
            + '<option value="AK">Alaska</option>'
            + '<option value="AZ">Arizona</option>'
            + '<option value="AR">Arkansas</option>'
            + '<option value="CA">California</option>'
            + '<option value="CO">Colorado</option>'
            + '<option value="CT">Connecticut</option>'
            + '<option value="DE">Delaware</option>'
            + '<option value="DC">District Of Columbia</option>'
            + '<option value="FL">Florida</option>'
            + '<option value="GA">Georgia</option>'
            + '<option value="HI">Hawaii</option>'
            + '<option value="ID">Idaho</option>'
            + '<option value="IL">Illinois</option>'
            + '<option value="IN">Indiana</option>'
            + '<option value="IA">Iowa</option>'
            + '<option value="KS">Kansas</option>'
            + '<option value="KY">Kentucky</option>'
            + '<option value="LA">Louisiana</option>'
            + '<option value="ME">Maine</option>'
            + '<option value="MD">Maryland</option>'
            + '<option value="MA">Massachusetts</option>'
            + '<option value="MI">Michigan</option>'
            + '<option value="MN">Minnesota</option>'
            + '<option value="MS">Mississippi</option>'
            + '<option value="MO">Missouri</option>'
            + '<option value="MT">Montana</option>'
            + '<option value="NE">Nebraska</option>'
            + '<option value="NV">Nevada</option>'
            + '<option value="NH">New Hampshire</option>'
            + '<option value="NJ">New Jersey</option>'
            + '<option value="NM">New Mexico</option>'
            + '<option value="NY">New York</option>'
            + '<option value="NC">North Carolina</option>'
            + '<option value="ND">North Dakota</option>'
            + '<option value="OH" selected>Ohio</option>'
            + '<option value="OK">Oklahoma</option>'
            + '<option value="OR">Oregon</option>'
            + '<option value="PA">Pennsylvania</option>'
            + '<option value="RI">Rhode Island</option>'
            + '<option value="SC">South Carolina</option>'
            + '<option value="SD">South Dakota</option>'
            + '<option value="TN">Tennessee</option>'
            + '<option value="TX">Texas</option>'
            + '<option value="UT">Utah</option>'
            + '<option value="VT">Vermont</option>'
            + '<option value="VA">Virginia</option>'
            + '<option value="WA">Washington</option>'
            + '<option value="WV">West Virginia</option>'
            + '<option value="WI">Wisconsin</option>'
            + '<option value="WY">Wyoming</option>'
            + '</select>';
    }
}

