from extensions import db
from datetime import datetime, timezone

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False, default='General')  
    createdAt = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updatedAt = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
