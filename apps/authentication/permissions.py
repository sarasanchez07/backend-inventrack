from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios con el rol 'admin'.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'admin'
        )