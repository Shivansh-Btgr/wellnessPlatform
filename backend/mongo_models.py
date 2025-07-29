# MongoEngine models for the wellness session platform
from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField, ReferenceField, ListField, URLField, connect
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from datetime import datetime


def ensure_mongo_connection():
    """Ensure MongoDB connection is established"""
    try:
        connect(host=settings.MONGODB_URI)
    except Exception as e:
        print(f"MongoDB connection failed: {e}")


class MongoUser(Document):
    """MongoEngine User model for MongoDB storage"""
    email = EmailField(required=True, unique=True)
    password_hash = StringField(max_length=128)
    created_at = DateTimeField(default=datetime.utcnow)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    
    meta = {
        'collection': 'users',
        'indexes': ['email']
    }
    
    def set_password(self, raw_password):
        """Hash and set password"""
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if provided password matches the stored hash"""
        return check_password(raw_password, self.password_hash)
    
    def __str__(self):
        return self.email


class MongoUserSession(Document):
    """MongoEngine UserSession model for MongoDB storage"""
    STATUS_CHOICES = ['draft', 'published']
    
    user_email = EmailField(required=True)  # Store user email instead of reference
    title = StringField(max_length=255, required=True)
    tags = ListField(StringField(max_length=50), default=list)
    json_file_url = URLField(required=True)
    status = StringField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_sessions',
        'indexes': ['user_email', 'status', 'created_at']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
