from django.urls import path
from .views import inpaint_view

urlpatterns = [
    path("inpaint/", inpaint_view, name="inpaint"),
]
