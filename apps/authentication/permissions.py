from rest_framework.permissions import BasePermission


class IsAdminUserCustom(BasePermission):
    """
    Permite acceso solo a usuarios administradores.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
