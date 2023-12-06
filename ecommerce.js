var cartID = "NULL";
// ecommerce.js
$(document).ready(function() {
    $('#filter-button').click(function() {
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
        }).done(function(response) {
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
            response.result.forEach(function(product) {
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
        }).fail(function(error) {
            console.log("error",error.statusText);
        });
    });
    
});
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
    }).done(function(response) {
        if (response.found === 0) {
            if (cartID === "NULL") {
                cartID = response.newCartID; 
            }
            updateCartDisplay();
            alert(response.Qty + " items added to cart successfully!");
        } else {
            alert(response.message);
        }
    }).fail(function(error) {
        console.log("Error adding to cart:", error.statusText);
    });
}

function updateCartDisplay() {
    $.ajax({
        url: 'http://172.17.12.44/cse383_final/final.php/getCartDetails',
        method: 'GET',
        dataType: 'json',
        data: { cartID: cartID }
    }).done(function(response) {
        if (response.status === 0) {
            $("#item-count").text(response.itemCount);
            $("#total-amount").text(response.totalAmount);
        } else {
            console.log("Error fetching cart details:", response.message);
        }
    }).fail(function(error) {
        console.log("AJAX error fetching cart details:", error.statusText);
    });
}




  
