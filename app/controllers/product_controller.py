from flask import Blueprint, request, jsonify, abort
from models.product import Product
from extensions import db
from datetime import datetime, timezone

product_bp = Blueprint('product_bp', __name__, url_prefix="/api/products")

def dict_product(product):
    """
    Convert a Product model instance to a dictionary.
    
    Args:
        product (Product): The Product model instance to convert
        
    Returns:
        dict: A dictionary containing the product's data with the following keys:
            - id (int): Product's unique identifier
            - name (str): Product's name
            - price (float): Product's price
            - description (str): Product's description
            - category (str): Product's category
            - createdAt (datetime): Product's creation timestamp
            - updatedAt (datetime): Product's last update timestamp
    """
    return {
        "id": product.id,
        "name":product.name,
        "price":product.price,
        "description":product.description,
        "category": product.category,
        "createdAt":product.createdAt,
        "updatedAt":product.updatedAt
    }

@product_bp.route('', methods=['POST'])
def create_product():
    """
    Create a new product.
    
    Endpoint: POST /api/products
    
    Request Body:
        {
            "name": str,      # Required: Product name
            "price": float,   # Required: Product price
            "description": str, # Optional: Product description
            "category": str   # Optional: Product category (defaults to 'General')
        }
    
    Returns:
        tuple: (response, status_code)
            - response (dict): Created product data
            - status_code (int): 201 for successful creation, 400 for invalid input
    
    Raises:
        400: If name or price is missing from the request
    """
    data = request.get_json()
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({"error":"Name and price are mandatory!"}), 400
    
    product = Product(
        name = data['name'],
        price = data['price'],
        description = data.get('description'),
        category=data.get('category', 'General')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(dict_product(product)), 201

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """
    Retrieve a specific product by ID.
    
    Endpoint: GET /api/products/<product_id>
    
    Args:
        product_id (int): The ID of the product to retrieve
    
    Returns:
        tuple: (response, status_code)
            - response (dict): Product data
            - status_code (int): 200 for success, 404 if product not found
    
    Raises:
        404: If product with the given ID doesn't exist
    """
    product = Product.query.get_or_404(product_id)
    return jsonify(dict_product(product)), 200

@product_bp.route('', methods=['GET'])
def list_products():
    """
    List all products with optional search functionality.
    
    Endpoint: GET /api/products
    
    Query Parameters:
        search (str, optional): Search term to filter products by name
    
    Returns:
        tuple: (response, status_code)
            - response (list): List of product dictionaries
            - status_code (int): 200 for success
    
    Example:
        GET /api/products?search=laptop
        Returns all products with 'laptop' in their name
    """
    search = request.args.get('search', '').strip()
    query = Product.query
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    products = query.all()
    return jsonify([dict_product(product) for product in products]), 200

@product_bp.route('/<int:product_id>', methods = ['PUT'])
def update_product(product_id):
    """
    Update an existing product.
    
    Endpoint: PUT /api/products/<product_id>
    
    Args:
        product_id (int): The ID of the product to update
    
    Request Body:
        {
            "name": str,      # Optional: New product name
            "price": float,   # Optional: New product price
            "description": str, # Optional: New product description
            "category": str   # Optional: New product category
        }
    
    Returns:
        tuple: (response, status_code)
            - response (dict): Updated product data
            - status_code (int): 200 for success, 400 for invalid input, 404 if product not found
    
    Raises:
        400: If request body is not valid JSON
        404: If product with the given ID doesn't exist
    """
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON!"}), 400
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'description' in data:
        product.description = data['description']
    if 'category' in data:
        product.category = data['category']
    product.updatedAt = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(dict_product(product))

@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """
    Delete a product.
    
    Endpoint: DELETE /api/products/<product_id>
    
    Args:
        product_id (int): The ID of the product to delete
    
    Returns:
        tuple: (response, status_code)
            - response (dict): Success message
            - status_code (int): 200 for success, 404 if product not found
    
    Raises:
        404: If product with the given ID doesn't exist
    """
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully!"}), 200

@product_bp.route('/bulk', methods=['POST'])
def bulk_insert_products():
    """
    Insert multiple products at once.
    
    Endpoint: POST /api/products/bulk
    
    Request Body:
        [
            {
                "name": str,      # Required: Product name
                "price": float,   # Required: Product price
                "description": str, # Optional: Product description
                "category": str   # Optional: Product category
            },
            ...
        ]
    
    Returns:
        tuple: (response, status_code)
            - response (dict): Success message with count of inserted products
            - status_code (int): 201 for success, 400 for invalid input
    
    Raises:
        400: If request body is not a list or if any product is missing required fields
    """
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({"error": "Expected a list of products"}), 400

    products = []
    for item in data:
        if 'name' not in item or 'price' not in item:
            return jsonify({"error": "Each product must include at least 'name' and 'price'"}), 400
        products.append(Product(
            name=item['name'],
            price=float(item['price']),
            description=item.get('description'),
            category=item.get('category')
        ))
    db.session.bulk_save_objects(products)
    db.session.commit()
    return jsonify({"message": f"{len(products)} products inserted successfully."}), 201


