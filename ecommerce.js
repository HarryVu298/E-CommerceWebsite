// ecommerce.js
$(document).ready(function() {
    $('#filter-button').click(function() {
        // If inputs are empty, use '%' as a wildcard to match any value
        var category = $('#category-input').val() || '%';
        var subcategory = $('#subcategory-input').val() || '%';
        var id = '0'; // Assuming '0' will fetch all products, adjust as needed

        $.ajax({
            url: 'http://172.17.12.44/cse383_final/final.php/getProduct',
            method: 'GET',
            dataType: 'json',
            data: {
                category: category,
                subcategory: subcategory,
                id: id
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
