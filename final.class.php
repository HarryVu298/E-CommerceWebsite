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
	public static function setTemp ($location, $sensor, $value)

	{
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($retData);
	}



       public static function getProduct ($subcategory, $minPrice, $maxPrice, $sort)

        {
               
                        try {
							$query = "SELECT * FROM product WHERE ";
							$params = [];
					
							if (!empty($subcategory)) {
								$query .= "subcategory LIKE ?";
								array_push($params, $subcategory);
							}
							if (!$minPrice == 'NULL') {
								$query .= " AND price >= ?";
								array_push($params, $minPrice);
							}
					
							if (!$maxPrice== 'NULL') {
								$query .= " AND price <= ?";
								array_push($params, $maxPrice);
							}
					
							if ($sort == "price_asc") {
								$query .= " ORDER BY price ASC";
							} elseif ($sort == "price_desc") {
								$query .= " ORDER BY price DESC";
							} elseif ($sort == "subcategory") {
								$query .= " ORDER BY subcategory";
							}
					
							$retData["result"] = GET_SQL($query, ...$params);
                        }
                        catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                        }
                

                return json_encode ($retData);
       }
}


