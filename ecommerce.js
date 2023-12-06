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
                        <td><button class="btn btn-primary add-to-cart-button" onclick="addItemToCart(${product.product_id}, 1)">Add to Cart</button></td>
                    </tr>`;
            });

            $("#product-table tbody").html(tableHtml);
        }).fail(function(error) {
            console.log("error",error.statusText);
        });
    });
    
});
function addItemToCart(productID, qty) {
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
            alert("Item added to cart successfully!");
        } else {
            alert(response.message);
        }
    }).fail(function(error) {
        console.log("Error adding to cart:", error.statusText);
    });
}

  
