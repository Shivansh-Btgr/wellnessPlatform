
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from users.permissions import IsAuthenticated
from .models import UserSession
from .serializers import UserSessionSerializer

# GET /sessions - Public wellness sessions (published only)
class PublicSessionsView(generics.ListAPIView):
    queryset = UserSession.objects.filter(status='published')
    serializer_class = UserSessionSerializer
    permission_classes = [AllowAny]

# GET /my-sessions - User’s own sessions (draft + published)
class MySessionsListView(generics.ListAPIView):
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)

# GET /my-sessions/:id - View a single user session
class MySessionDetailView(generics.RetrieveAPIView):
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)

# POST /my-sessions/save-draft - Save or update a draft session
class SaveDraftSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.pk
        data['status'] = 'draft'
        session_id = data.get('id')
        if session_id:
            try:
                session = UserSession.objects.get(pk=session_id, user=request.user)
            except UserSession.DoesNotExist:
                return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserSessionSerializer(session, data=data, partial=True)
        else:
            serializer = UserSessionSerializer(data=data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user, status='draft')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# POST /my-sessions/publish - Publish a session
class PublishSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('id')
        if not session_id:
            return Response({'detail': 'Session id required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            session = UserSession.objects.get(pk=session_id, user=request.user)
        except UserSession.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Patch any provided fields and set status to published
        serializer = UserSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status='published')
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
