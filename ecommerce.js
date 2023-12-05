// ecommerce.js
$(document).ready(function() {
    $('#filter-button').click(function() {
        var category = $('#category-input').val() || '%';
        var minPrice = $('#min-price-input').val() || 'NULL';
        var maxPrice = $('#max-price-input').val() || 'NULL';
        var sort = $('#sort-input').val() || 'NULL';

        $.ajax({
            url: 'http://172.17.12.44/cse383_final/final.php/getProduct',
            method: 'GET',
            dataType: 'json',
            data: {
                category: category,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sort: sort
            }
        }).done(function(response) {
            if (!response.result) {
                alert("No products found.");
                return;
            }

            var tableHtml = "";
            response.result.forEach(function(product) {
                tableHtml += 
                    `<tr>
                        <td>${product.product_id}</td>
                        <td>${product.title}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>${product.category}</td>
                        <td>${product.rating || 'N/A'}</td>
                        <td>${product.count || 'N/A'}</td>
                        <td><img src="${product.image}" alt="${product.title}" style="width: 100px; height: auto;"></td>
                        <td>${product.subcategory}</td>
                    </tr>`;
            });

            $("#product-table tbody").html(tableHtml);
        }).fail(function(error) {
            console.log("error",error.statusText);
        });
    });
});
