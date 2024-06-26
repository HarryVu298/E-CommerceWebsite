//localStorage.removeItem('cartID');
var cartID = localStorage.getItem('cartID') || "NULL";
console.log("cartID: ", cartID);
var cartIDPrintOrder = localStorage.getItem('cartIDPrintOrder') || "NULL";
var cartIDForViewOrderDetails = "NULL";
// ecommerce.js
$(document).ready(function () {
    console.log("CartIDPrintOrder: ", cartIDPrintOrder);
    var currentUrl = window.location.href;
    updateCartDisplay();
    console.log(cartID);

    $('#filter-button').click(function () {
        var subcategory = $('#subcategory-input').val() || '%';
        var minPrice = $('#min-price-input').val() || 'NULL';
        var maxPrice = $('#max-price-input').val() || 'NULL';
        var sort = $('#sort-input').val() || 'NULL';

        $.ajax({
            url: 'final.php/getProduct',
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
        console.log(cartID);
    }

    if (currentUrl.includes("printableOrder.html") && cartIDPrintOrder !== "NULL") {
        updatePrintableOrder();
        console.log(cartID);
    }

    if (currentUrl.includes("myOrder.html")) {
        filterOrders();
    }


    $(".place-order-button").click(function () {
        var isValid = true;

        var name = $('#name');
        if (!name.val()) {
            name.focus();
            isValid = false;
            alert('Please enter your full name.');
            return;
        }

        var address1 = $('#address1');
        if (!address1.val()) {
            address1.focus();
            isValid = false;
            alert('Please enter your address.');
            return;
        }

        var city = $('#city');
        if (!city.val()) {
            city.focus();
            isValid = false;
            alert('Please enter your city.');
            return;
        }

        var stateText = $('#stateText');
        var country = $('#country');
        if (country.val() !== "United States") {
            if (!stateText.val()) {
                stateText.focus();
                isValid = false;
                alert('Please enter your state/province.');
                return;
            }
        }


        var postalCode = $('#postalCode');
        if (!postalCode.val()) {
            postalCode.focus();
            isValid = false;
            alert('Please enter your postal code.');
            return;
        }

        var cardSelected = $('#paymentCard').is(':checked');
        if (cardSelected) {
            var cardNumber = $('#cardNumber');
            if (!cardNumber.val()) {
                cardNumber.focus();
                isValid = false;
                alert('Please enter your card number.');
                return;
            }

            var cardName = $('#cardName');
            if (!cardName.val()) {
                cardName.focus();
                isValid = false;
                alert('Please enter your name on the card.');
                return;
            }

            var expiryDate = $('#expiryDate');
            if (!expiryDate.val()) {
                expiryDate.focus();
                isValid = false;
                alert('Please enter your expiry date.');
                return;
            }

            var cvv = $('#cvv');
            if (!cvv.val()) {
                cvv.focus();
                isValid = false;
                alert('Please enter your cvv.');
                return;
            }

        }
        if (isValid) {
            localStorage.setItem('cartIDPrintOrder', cartID);
            window.open("printableOrder.html", "_blank");
            makeSale();
            localStorage.removeItem('cartID');
            window.open("comfirmation.html", "_self");
        }
    });

    // Format for cart number using event listener
    $('#cardNumber').on('input', function () {
        $(this).val($(this).val().replace(/[^\d]/g, '').substring(0, 16));
    });

    // format for expiry date to MM/YY
    $('#expiryDate').on('input', function () {
        $(this).val($(this).val().replace(/[^\d\/]/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 5));
    });

    // format for CVV 
    $('#cvv').on('input', function () {
        $(this).val($(this).val().replace(/[^\d]/g, '').substring(0, 4));
    });




});

function updateCartOverview() {
    $.ajax({
        url: 'final.php/getCartItems',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function (response) {
        if (response.found === 0) {
            var tableHtml = "";
            console.log(response.cart);
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
        url: 'final.php/addItemToCart',
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
        url: 'final.php/getCartDetails',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function (response) {
        if (response.status === 0) {
            $("#item-count").text(response.itemCount);
            $("#total-amount").text(response.totalAmount);
            $("#item-count-2").text(response.itemCount);
            $("#total-amount-2").text("$" + response.totalAmount);
            var shipping = 2;
            $("#shippingfee").text("$" + shipping.toFixed(2));
            var tax = parseFloat((response.totalAmount * 0.09).toFixed(2));
            $("#tax").text("$" + tax);
            var totalAfterTax = (shipping + parseFloat(response.totalAmount) + tax).toFixed(2);
            $("#totalaftertax").text("$" + totalAfterTax);
            $("#totalaftertax2").text(totalAfterTax);

        } else {
            $("#item-count").text('0');
            $("#total-amount").text('0.00');
            $("#item-count-2").text('0');
            $("#total-amount-2").text("$0.00");
            $("#shippingfee").text("$0.00");
            $("#tax").text("$0.00");
            $("#totalaftertax").text("$0.00");
            $("#totalaftertax2").text("0.00");
            console.log("Error fetching cart details:", response.message);
        }
    }).fail(function (error) {
        console.log("AJAX error fetching cart details:", error.statusText);
    });
}



function removeItemFromCart(cartID, productID) {
    $.ajax({
        url: 'final.php/RemoveitemFromCart',
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
        url: 'final.php/updateCartItemQuantity',
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
    var country = $("#country").val();
    console.log(country);
    var stateField = $("#stateField");

    if (country !== "United States") {
        // If the selected country is not the US, switch to a text field
        stateField.html('<label for="state" class="form-label">State/Province: <span class="required">*</span></label><input type="text" id="stateText" name="state" class="form-control" required>');
    } else {
        // If the US is selected, use a dropdown for states
        stateField.html('<label for="state" class="form-label">State <span class="required">*</span></label>' + '<select id="state" name="state" class="form-control">'
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
            + '</select>');
    }
}

function toggleCardForm() {
    var cardSelected = $('#paymentCard').is(':checked');
    var cardForm = $('#cardForm');

    if (cardSelected) {
        cardForm.show();
    } else {
        cardForm.hide();
    }

    $('#cardNumber').prop('required', cardSelected);
    $('#cardName').prop('required', cardSelected);
    $('#expiryDate').prop('required', cardSelected);
    $('#cvv').prop('required', cardSelected);
}


function makeSale() {
    console.log("makeSale() is called");
    $.ajax({
        url: 'final.php/makeSale',
        method: 'POST',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function (response) {
        if (response.found == 0) {
            cartID = "NULL";
            console.log("Hello CartID: ", cartID);
            updateCartDisplay();
            alert("Thank you for shopping with Harryzon!");
        } else {
            console.log("Error closing the cart:", response.message);
        }
    }).fail(function (error) {
        console.log("AJAX error fetching cart details:", error.statusText);
    });
}


// function updatePrintableOrder() {
//     console.log("orderprint: " + cartIDPrintOrder);
//     $.ajax({
//         url: 'final.php/getCartItemsForPrint',
//         method: 'GET',
//         dataType: 'json',
//         data: { cartID: cartIDPrintOrder }
//     }).done(function (response) {
//         if (response.found === 0) {
//             var tableHtml = "";
//             $("#orderNumber").text(cartIDPrintOrder);
//             var currentTimestamp = new Date(); 
//             var formattedDate = currentTimestamp.toISOString().split('T')[0];

//             $("#orderCloseDate").text(formattedDate);
//             response.cart.forEach(function (item) {
//                 tableHtml += `<tr>
//                     <td>${item.title}</td>
//                     <td>${item.description}</td>
//                     <td>${item.Qty}</td>
//                     <td>$${item.price}</td>
//                 </tr>`;
//             });
//             $("#product-table tbody").html(tableHtml);
//         } else {
//             alert("Error loading cart items: " + response.message);
//         }
//     }).fail(function (error) {
//         console.log("Error fetching cart items:", error);
//     });
// }

// function updateCostDisplayPrintOrder()
// {
//     $.ajax({
//         url: 'final.php/getCartDetails',
//         method: 'GET',
//         dataType: 'json',
//         data: { cartID: cartIDPrintOrder }
//     }).done(function (response) {
//         if (response.status === 0) {
//             $("#item-count").text(response.itemCount);
//             $("#total-amount").text(response.totalAmount);
//             $("#item-count-2").text(response.itemCount);
//             $("#total-amount-2").text("$" + response.totalAmount);
//             var shipping = 2;
//             $("#shippingfee").text("$" + shipping.toFixed(2));
//             var tax = parseFloat((response.totalAmount * 0.09).toFixed(2));
//             $("#tax").text("$" + tax);
//             var totalAfterTax = (shipping + parseFloat(response.totalAmount) + tax).toFixed(2);
//             $("#totalaftertax").text("$" + totalAfterTax);
//             $("#totalaftertax2").text(totalAfterTax);

//         } else {
//             $("#item-count").text('0');
//             $("#total-amount").text('0.00');
//             $("#item-count-2").text('0');
//             $("#total-amount-2").text("$0.00");
//             $("#shippingfee").text("$0.00");
//             $("#tax").text("0.00");
//             $("#totalaftertax").text("$0.00");
//             $("#totalaftertax2").text("0.00");
//             console.log("Error fetching cart details:", response.message);
//         }
//     }).fail(function (error) {
//         console.log("AJAX error fetching cart details:", error.statusText);
//     });
// }


function updatePrintableOrder() {
    console.log("orderprint: " + cartIDPrintOrder);

    $.ajax({
        url: 'final.php/getCartCompleteDetailsForPrint',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartIDPrintOrder }
    }).done(function (response) {
        if (response.status === 0) {
            console.log("Here is the response: ", response);
            // Update order details
            var tableHtml = "";
            $("#orderNumber").text(cartIDPrintOrder);
            var formattedDate;
            if (!response.cartItems[0].closedDateTime) {
                var currentTimestamp = new Date();
                formattedDate = currentTimestamp.toISOString().split('T')[0];
            } else {
                formattedDate = response.cartItems[0].closedDateTime;
            }
            $("#orderCloseDate").text(formattedDate);

            response.cartItems.forEach(function (item) {
                tableHtml += `<tr>
                    <td>${item.title}</td>
                    <td>${item.description}</td>
                    <td>${item.Qty}</td>
                    <td>$${item.price}</td>
                </tr>`;
            });
            $("#product-table tbody").html(tableHtml);

            // Update cost display
            $("#item-count").text(response.itemCount);
            $("#total-amount").text(response.totalAmount);
            var shipping = 2;
            var tax = parseFloat((response.totalAmount * 0.09).toFixed(2));
            var totalAfterTax = (shipping + parseFloat(response.totalAmount) + tax).toFixed(2);

            $("#item-count-2").text(response.itemCount);
            $("#total-amount-2").text("$" + response.totalAmount);
            $("#shippingfee").text("$" + shipping.toFixed(2));
            $("#tax").text("$" + tax);
            $("#totalaftertax").text("$" + totalAfterTax);
            $("#totalaftertax2").text(totalAfterTax);
        } else {
            alert("Error loading order details: " + response.message);
        }
    }).fail(function (error) {
        console.log("Error fetching order details:", error);
    });
}




function filterOrders() {
    var startDate = $('#startDate').val() || " ";
    var endDate = $('#endDate').val() || " ";

    $.ajax({
        url: 'final.php/FindClosedCarts',
        method: 'GET',
        dataType: 'json',
        data: {
            startDate: startDate,
            endDate: endDate
        }
    }).done(function (response) {
        console.log(response);
        updateOrdersTable(response.result);
    }).fail(function (error) {
        console.log("Error loading filtered orders:", error);
    });
}

function updateOrdersTable(result) {

    var tableHtml = "";
    result.forEach(function (order) {
        tableHtml += `<tr>
                    <td>${order.cartID}</td>
                    <td>${order.closedDateTime}</td>
                    <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" onclick="viewOrderDetails(${order.cartID})" data-bs-target="#orderDetailsModal">Details</button></td>
                    <td><button type="button" class="btn btn-primary" onclick="printOrder(${order.cartID})">Print</button></td>
                </tr>`;
    })

    $("#closedOrdersTable").html(tableHtml);
}

function printOrder(cartID) {
    localStorage.setItem('cartIDPrintOrder', cartID);
    window.open("printableOrder.html", "_blank");
}



function viewOrderDetails(orderID) {
    cartIDForViewOrderDetails = orderID;
    console.log("cartIDForViewOrderDetails: " + cartIDForViewOrderDetails);
    // Clear previous data
    $('#orderDetailsTable tbody').empty();
    // Fetch and populate data
    $.ajax({
        url: 'final.php/getCartItemsForPrint',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartIDForViewOrderDetails }
    }).done(function (response) {
        console.log("response: ", response);
        updateOrderTotalInViewOrder(cartIDForViewOrderDetails);
        if (response.found === 0) {
            response.cart.forEach(function (item) {
                var rowHtml = `<tr>
                          <td><img src="${item.image}" alt="${item.title}" style="width: 100px; height: auto;"></td>
                          <td>${item.title}</td>
                          <td>${item.description}</td>
                          <td>${item.subcategory}</td>
                          <td>${item.Qty}</td>
                          <td>$${item.price}</td>
                        </tr>`;
                $('#orderDetailsTable tbody').append(rowHtml);
            });
            $('#orderDetailsModal').modal('show');
        } else {
            alert("Error loading order details: " + response.message);
        }
    }).fail(function (error) {
        console.log("Error fetching order details:", error);
    });
}

function updateOrderTotalInViewOrder(orderID) {
    cartIDForViewOrderDetails = orderID;
    $.ajax({
        url: 'final.php/getCartDetails',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartIDForViewOrderDetails }
    }).done(function (response) {
        if (response.status === 0) {
            $("#item-count-view-order").text(response.itemCount);
            var shipping = 2;
            var tax = parseFloat((response.totalAmount * 0.09).toFixed(2));
            var totalAfterTax = (shipping + parseFloat(response.totalAmount) + tax).toFixed(2);
            $("#total-after-tax-view-order").text("$" + totalAfterTax);

        } else {
            $("#item-count-view-order").text("0");
            $("#total-after-tax-view-order").text("$0.00");
            console.log("Error fetching cart details:", response.message);
        }
    }).fail(function (error) {
        console.log("AJAX error fetching cart details:", error.statusText);
    });
}

function proceedToCheckout() {
    var cartItemCount = $("#item-count-2").text();
    if (parseInt(cartItemCount) > 0) {
        window.location.href = 'checkout.html';
    } else {
        alert("Your cart is empty.");
    }
}



