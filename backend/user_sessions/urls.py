from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.PublicSessionsView.as_view(), name='public-sessions'),
    path('my-sessions/', views.MySessionsListView.as_view(), name='my-sessions'),
    path('my-sessions/<int:pk>/', views.MySessionDetailView.as_view(), name='my-session-detail'),
    path('my-sessions/save-draft/', views.SaveDraftSessionView.as_view(), name='save-draft-session'),
    path('my-sessions/publish/', views.PublishSessionView.as_view(), name='publish-session'),
]
