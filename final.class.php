<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	// public static function setTemp ($location, $sensor, $value)

	// {
	// 	if (!is_numeric($value)) {
	// 		$retData["status"]=1;
	// 		$retData["message"]="'$value' is not numeric";
	// 	}
	// 	else {
	// 		try {
	// 			EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
	// 			$retData["status"]=0;
	// 			$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
	// 		}
	// 		catch  (Exception $e) {
	// 			$retData["status"]=1;
	// 			$retData["message"]=$e->getMessage();
	// 		}
	// 	}

	// 	return json_encode ($retData);
	// }



       public static function getProduct ($subcategory, $minPrice, $maxPrice, $sort)

        {
               
                        try {
							$query = "SELECT * FROM product WHERE ";
							$params = [];
					
							if (!empty($subcategory)) {
								$query .= "subcategory LIKE ?";
								array_push($params, $subcategory);
							}
							if ($minPrice != 'NULL') {
								// $minPrice = float($minPrice);	
								$query .= " AND price >= ?";
								array_push($params, $minPrice);
							}
					
							if ($maxPrice!= 'NULL') {
								// $maxPrice = float($maxPrice);
								$query .= " AND price <= ?";
								array_push($params, $maxPrice);
							}
							
							$query .= " AND description <> '' AND image <> ''";

					
							if ($sort == "price_asc") {
								$query .= " ORDER BY price ASC";
							} elseif ($sort == "price_desc") {
								$query .= " ORDER BY price DESC";
							} elseif ($sort == "subcategory") {
								$query .= " ORDER BY subcategory";
							}
                            $retData["debug1"]=print_r($query, true);
                            $retData["debug2"]=print_r($params, true);
							$retData["result"] = GET_SQL($query, ...$params);
                        }
                        catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                        }
                

                return json_encode ($retData);
       }


	//    public static function createShoppingCart() {
    //         try {
    //             EXEC_SQL("INSERT INTO cart (closedDateTime) VALUES (NULL)");
    //             $retData["result"] = GET_SQL("SELECT last_insert_rowid() as cartID");
    //             $retData["status"] = 0;
    //             $retData["message"] = "Cart created";
    //             $retData["cartID"] = $retData["result"][0]["cartID"];
    //         } catch (Exception $e) {
    //             $retData["status"] = 1;
    //             $retData["message"] = $e->getMessage();
    //         }
    //         return json_encode($retData);
    //     }

    public static function addItemToCart($cartID, $productID, $Qty) {
        if ($cartID === "NULL") {
            EXEC_SQL("INSERT INTO cart (closedDateTime) VALUES (NULL)");
            $retData["created"] = GET_SQL("SELECT last_insert_rowid() as cartID");
            $cartID = $retData["created"][0]["cartID"];
            $retData["newCartID"] = $cartID; 
        }
        try {
            $retData["Qty"] = $Qty;
            $cart = GET_SQL("SELECT cartID FROM cart WHERE cartID = ? AND closedDateTime IS NULL", $cartID);
            if (count($cart) > 0) {
                $item = GET_SQL("SELECT * FROM cartItem WHERE cartID = ? AND product_id = ?", $cartID, $productID);
                if (count($item) > 0) {
                    EXEC_SQL("UPDATE cartItem SET qty = qty + ? WHERE cartID = ? AND product_id = ?", $Qty, $cartID, $productID);
                    $retData["found"] = 0;
                    $retData["message"] = "Existing product $productID set to $Qty";
                } else {
                    EXEC_SQL("INSERT INTO cartItem (Qty, cartID, Product_id) VALUES (?, ?, ?)", $Qty, $cartID, $productID);
                    $retData["found"] = 0;
                    $retData["message"] = "Product $productID added to cart with quantity = $Qty";
                }
            } else {
                $retData["found"] = 1;
                $retData["message"] = "Cart not found or not available";
            }
        } catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = $e->getMessage();
        }
        return json_encode($retData);
    }

    public static function getCartDetails($cartID) {
        try {
            $cartDetails = GET_SQL("SELECT SUM(Qty) as itemCount, SUM(Qty * price) as totalAmount FROM cartItem JOIN product ON cartItem.product_id = product.product_id WHERE cartID = ?", $cartID);
    
            if ($cartDetails[0]["itemCount"] != "") {
                $retData["itemCount"] = $cartDetails[0]["itemCount"];
                $retData["totalAmount"] = $cartDetails[0]["totalAmount"];
                $retData["status"] = 0;
            } else {
                $retData["itemCount"] = 0;
                $retData["totalAmount"] = 0.00;
                $retData["status"] = 1;
            }
        } catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"] = $e->getMessage();
        }
    
        return json_encode($retData);
    }

    public static function getCartItems($cartID) {
        try {
            $retData["cart"]=GET_SQL("select * from cart join cartItem using (cartID)
                                    join product using (Product_id)
                                    where cart.cartID=? and cart.closedDateTime is null order by
                                    Category,Subcategory,Title", $cartID);
            $retData["found"] = 0;
            $retData["message"]="Returned all items in cart $cartID";
        } catch (Exception $e) {
            $retData["found"] = 1;
            $retData["message"] = $e->getMessage();
        }
    
        return json_encode($retData);
    }

    public static function getCartItemsForPrint($cartID) {
        try {
            $retData["cart"]=GET_SQL("select * from cart join cartItem using (cartID)
                                    join product using (Product_id)
                                    where cart.cartID=? order by
                                    Category,Subcategory,Title", $cartID);
            $retData["found"] = 0;
            $retData["message"]="Returned all items in cart $cartID";
        } catch (Exception $e) {
            $retData["found"] = 1;
            $retData["message"] = $e->getMessage();
        }
    
        return json_encode($retData);
    }

    public static function RemoveitemFromCart($cartID, $productID) {
        $found = GET_SQL("SELECT cart.cartID FROM cart JOIN cartItem USING (cartID) WHERE cart.cartID=? AND product_id = ? AND cart.closedDateTime IS NULL", $cartID, $productID);
        try {
            if (count($found) > 0) {
                EXEC_SQL("DELETE FROM cartItem WHERE cartID=? AND product_id=?", $cartID, $productID);
                $retData["found"] = 0;
                $retData["message"] = "Item removed successfully";
            } else {
                $retData["found"] = 1;
                $retData["message"] = "Item not found in the cart";
            }
        } catch (Exception $e) {
            $retData["found"] = 1;
            $retData["message"] = $e->getMessage();
        }
        

        return json_encode($retData);
    }

    public static function updateCartItemQuantity($cartID, $productID, $newQty) {
        try {
            $cart = GET_SQL("SELECT cartID FROM cart WHERE cartID = ? AND closedDateTime IS NULL", $cartID);
            if (count($cart) > 0) {
                EXEC_SQL("UPDATE cartItem SET Qty = ? WHERE cartID = ? AND product_id = ?", $newQty, $cartID, $productID);
                $retData["status"] = 0;
                $retData["message"] = "Update quantity successfully!";
            } else {
                $retData["status"] = 1;
                $retData["message"] = "Cart not found or closed";
            }
        } catch (Exception $e) {
            $retData["status"] = 1;
            $retData["message"]= $e -> getMessage();
        }
        return json_encode($retData);
    }

    public static function makeSale($cartID) {
        try {
            $CART=GET_SQL("SELECT cart.cartID FROM cart where cart.cartID = ? AND cart.closedDateTime IS NULL", $cartID);
            if (count($CART) > 0) {
                EXEC_SQL("UPDATE cart SET closedDateTime=CURRENT_TIMESTAMP WHERE cartID = ?", $cartID);
                $retData["found"] = 0;
                $retData["message"] = "Close cart $cartID successfully!";
            }
        } catch (Exception $e) {
            $retData["found"] = 1;
            $retData["message"]= $e -> getMessage();
        }
        return json_encode($retData);
    }

}


