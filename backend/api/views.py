from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Block, BlockScore, Participant, ScoreOption
from .serializers import BlockSerializer, BlockScoreSerializer, \
    LoginSerializer, ParticipantSerializer, BlockScoreCreateSerializer, \
    ScoreOptionSerializer
from .permissions import IsOwnerOrStaff, IsStaffOrCreateOnly, \
    ReadOnlyPermission, IsStaffOrReadOnly
from rest_framework.response import Response
from knox.models import AuthToken
from django.contrib.auth import authenticate

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [IsStaffOrCreateOnly]

    def get_queryset(self):
        """
        Staff can see all participants.
        Regular users can only see themselves.
        """
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Participant.objects.all()
        # Regular users can only see their own data
        return Participant.objects.filter(id=user.id)

    def list(self, request, *args, **kwargs):
        """
        List participants with optional filtering by cup category.
        Staff can filter, regular users only see themselves.
        """
        cup = request.query_params.get('cup')
        queryset = self.get_queryset()
        if cup and (request.user.is_staff or request.user.is_superuser):
            queryset = queryset.filter(cup=cup)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get a single participant by ID.
        Staff can view anyone, users can only view themselves.
        """
        instance = self.get_object()
        # Check if user has permission to view this participant
        if not (request.user.is_staff or request.user.is_superuser or 
                instance.id == request.user.id):
            return Response(
                {'error': 'No tiene permiso para ver este participante'}, 
                status=403
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new participant.
        Anyone can register (create), but only staff can set permissions.
        """
        # Create a mutable copy of request.data
        data = request.data.copy()
        
        # Remove permission fields if user is not staff
        if not (request.user.is_authenticated and 
                (request.user.is_staff or request.user.is_superuser)):
            data.pop('is_staff', None)
            data.pop('is_superuser', None)
            data.pop('is_active', None)
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing participant.
        Users can update themselves, staff can update anyone.
        Staff can update is_active, regular users cannot.
        """
        instance = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or 
                instance.id == request.user.id):
            return Response(
                {'error': 'No tiene permiso para editar este participante'}, 
                status=403
            )
        
        # Create a mutable copy of request.data
        data = request.data.copy()
        
        # Regular users can't change permission fields or score/distance
        if not (request.user.is_staff or request.user.is_superuser):
            data.pop('is_staff', None)
            data.pop('is_superuser', None)
            data.pop('is_active', None)
            data.pop('score', None)
            data.pop('distance_climbed', None)
        
        # Use the mutable data for serialization
        serializer = self.get_serializer(instance, data=data, 
                                         partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a participant.
        Only staff can delete.
        """
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Solo el staff puede eliminar participantes'}, 
                status=403
            )
        return super().destroy(request, *args, **kwargs)
    
class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [IsStaffOrReadOnly]

    def list(self, request, *args, **kwargs):
        """
        List blocks with optional filtering by lane or grade.
        All authenticated users can read (GET only).
        """
        lane = request.query_params.get('lane')
        grade = request.query_params.get('grade')
        queryset = self.get_queryset()
        if lane:
            queryset = queryset.filter(lane=lane)
        if grade:
            queryset = queryset.filter(grade=grade)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    # To do: Implement retrieve, create, update, destroy if needed for future
    # versions. iRock v1.0 only requires listing blocks, and all blocks will
    # be pre-defined by admins via csv script.
    
class BlockScoreViewSet(viewsets.ModelViewSet):
    queryset = BlockScore.objects.all()
    serializer_class = BlockScoreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Staff can see all scores.
        Regular users can only see their own scores.
        """
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return BlockScore.objects.all()
        # Regular users can only see their own scores
        return BlockScore.objects.filter(participant=user)

    def get_serializer_class(self):
        """
        Use a different serializer for creation to filter 
        score_option correctly.
        """
        if self.action == 'create':
            return BlockScoreCreateSerializer
        return super().get_serializer_class()

    def create(self, request, *args, **kwargs):
        """
        Create a new BlockScore entry ensuring 
        score_option is valid for the block.
        Users can only create scores for themselves.
        """
        # Regular users can only create scores for themselves
        if not (request.user.is_staff or request.user.is_superuser):
            request.data['participant'] = request.user.id
        
        return super().create(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """
        List BlockScores with optional filtering by participant or block.
        Staff can filter by anyone, users only see their own scores.
        """
        participant_id = request.query_params.get('participant')
        block_id = request.query_params.get('block')
        queryset = self.get_queryset()
        
        # Staff can filter by participant, regular users can't
        if participant_id and (request.user.is_staff or 
                               request.user.is_superuser):
            queryset = queryset.filter(participant_id=participant_id)
        
        if block_id:
            queryset = queryset.filter(block_id=block_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """
        Update a BlockScore.
        Users can only update their own scores.
        """
        instance = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or 
                instance.participant.id == request.user.id):
            return Response(
                {'error': 'No tiene permiso para editar este score'}, 
                status=403
            )
        
        # Regular users can't change the participant
        if not (request.user.is_staff or request.user.is_superuser):
            request.data['participant'] = request.user.id
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a BlockScore.
        Users can delete their own scores, staff can delete any.
        """
        instance = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser or 
                instance.participant.id == request.user.id):
            return Response(
                {'error': 'No tiene permiso para eliminar este score'}, 
                status=403
            )
        return super().destroy(request, *args, **kwargs)

class LoginViewSet(viewsets.ViewSet):
    """
    ViewSet to handle user login and return auth token.
    """
    # Allow any user (authenticated or not) to access this view
    permission_classes = []
    serializer_class = LoginSerializer

    def create(self, request):
        serializer_class = self.serializer_class(data=request.data)
        serializer_class.is_valid(raise_exception=True)
        email = serializer_class.validated_data['email']
        password = serializer_class.validated_data['password']
        user = authenticate(request, username=email, password=password)
        if user is not None:
            # Generate token
            token = AuthToken.objects.create(user)[1]
            return Response(
                {
                    'token': token,
                    'user_id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    # Fields added for client use
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active,
                    'cup': user.cup,
                }
            )
        else:
            return Response({'error': 'Invalid Credentials'}, status=401)  

class ScoreOptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet to retrieve and manage score options for blocks.
    Read-only for authenticated users, write for staff.
    """
    queryset = ScoreOption.objects.all()
    serializer_class = ScoreOptionSerializer
    permission_classes = [IsStaffOrReadOnly]

    def list(self, request, *args, **kwargs):
        """
        List score options with optional filtering by block.
        """
        block_id = request.query_params.get('block')
        queryset = self.get_queryset()
        
        if block_id:
            queryset = queryset.filter(block_id=block_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
