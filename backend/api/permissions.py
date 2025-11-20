from rest_framework import permissions


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow staff users to edit objects.
    Read-only permissions are allowed to any authenticated user.
    """
    def has_permission(self, request, view):
        # Allow read permissions to authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Write permissions only for staff
        return request.user and request.user.is_staff


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to view/edit 
    it.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Staff can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Users can only access their own object
        return obj == request.user


class IsStaffOrCreateOnly(permissions.BasePermission):
    """
    Permission to allow anyone to create (register), but only staff to 
    list/edit.
    """
    def has_permission(self, request, view):
        # Allow POST (create) to anyone
        if request.method == 'POST' and view.action == 'create':
            return True
        
        # Allow authenticated users to retrieve their own data (checked in view)
        if request.user and request.user.is_authenticated:
            return True
        
        # Everything else requires staff
        return request.user and request.user.is_staff


class ReadOnlyPermission(permissions.BasePermission):
    """
    Permission to only allow read-only access.
    """
    def has_permission(self, request, view):
        # Only allow GET, HEAD, OPTIONS
        return request.method in permissions.SAFE_METHODS and \
               request.user and request.user.is_authenticated
