from flask import Blueprint, request, jsonify, abort
from models.product import Product
from extensions import db
from datetime import datetime, timezone

product_bp = Blueprint('product_bp', __name__, url_prefix="/api/products")

def dict_product(product):
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
    product = Product.query.get_or_404(product_id)
    return jsonify(dict_product(product)), 200

@product_bp.route('', methods=['GET'])
def list_products():
    products = Product.query.all()
    return jsonify([dict_product(product) for product in products]), 200

@product_bp.route('/<int:product_id>', methods = ['PUT'])
def update_product(product_id):
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
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully!"}), 200

@product_bp.route('/bulk', methods=['POST'])
def bulk_insert_products():
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


