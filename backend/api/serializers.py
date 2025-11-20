from rest_framework import serializers
from .models import Block, ScoreOption, Participant, BlockScore
from django.contrib.auth import get_user_model

"""
Serializers for the iRock climbing competition models.
IMPORTANT!!!: Serializers handle the conversion between model instances
and JSON representations for API interactions.
"""
User = get_user_model()

class ScoreOptionSerializer(serializers.ModelSerializer):
    """
    Serializer for ScoreOption model.
    """
    class Meta:
        model = ScoreOption
        fields = [
            'id', 
            'block', 
            'key', 
            'label', 
            'order',
            'points'
        ]


class BlockSerializer(serializers.ModelSerializer):
    """
    Serializer for Block model including nested ScoreOptions.
    """
    # Score options related to this block, a block has many score options
    score_options = ScoreOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Block
        fields = [
            'id', 
            'lane', 
            'grade', 
            'color', 
            'wall',
            'distance',
            'active',
            'block_type',
            'score_options',
            'created_at',
        ]
        read_only_fields = ['created_at']


class ParticipantSerializer(serializers.ModelSerializer):
    """
    Serializer for Participant model.
    """
    class Meta:
        model = Participant
        fields = [
            'id', 
            'last_name',
            'first_name',
            'username',
            'age',
            'date_of_birth',
            'gender',
            'email', 
            'phone', 
            'cup', 
            'registered_at', 
            'score',
            'distance_climbed',
            'password',
            'is_staff',      
            'is_superuser',   
            'is_active',     
        ]
        read_only_fields = [
            'registered_at', 
            'score', 
            'distance_climbed',
            'is_staff',    
            'is_superuser',
            # is_active is NOT read-only - staff can update it
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Overriding create to handle password hashing.
        """
        password = validated_data.pop('password', None)
        participant = Participant(**validated_data)
        if password:
            participant.set_password(password)
        participant.save()
        return participant

    def update(self, instance, validated_data):
        """
        Overriding update to handle password hashing if provided.
        """
        password = validated_data.pop('password', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class BlockScoreSerializer(serializers.ModelSerializer):
    """
    Srializer for BlockScore, this serializer filters the socre_option
    for the block
    """
    # Show all external related fields
    participant_name = serializers.CharField(
        source='participant.username', read_only=True
    )
    block_lane = serializers.CharField(
        source='block.lane', read_only=True
    )
    score_option_label = serializers.CharField(
        source='score_option.label', read_only=True
    )
    
    class Meta:
        model = BlockScore
        fields = [
            'id', 
            'participant', 
            'block', 
            'score_option', 
            'participant_name', 
            'block_lane', 
            'score_option_label',
            'earned_points',
            'created_at'
        ]
        read_only_fields = ['created_at', 'earned_points']
    
    def validate(self, data):
        """
        This function validates that the score is for the desired block
        """
        block = data.get('block')
        score_option = data.get('score_option')
        
        if block and score_option:
            if score_option.block_id != block.id:
                raise serializers.ValidationError(
                    "La opción de score no pertenece al bloque indicado."
                )
        
        return data


class BlockScoreCreateSerializer(serializers.ModelSerializer):
    """
    Simple serializer for creating BlockScore with IDs
    """
    
    class Meta:
        model = BlockScore
        fields = [
            'id', 
            'participant', 
            'block', 
            'score_option',
            'earned_points',
            'created_at'
        ]
        read_only_fields = ['created_at', 'earned_points']
    
    def validate(self, data):
        """
        Validate that score_option belongs to block
        """
        block = data.get('block')
        score_option = data.get('score_option')
        
        if block and score_option:
            if score_option.block_id != block.id:
                raise serializers.ValidationError(
                    "La opción de score no pertenece al bloque indicado."
                )
        
        return data

class LoginSerializer(serializers.Serializer):
    """
    Serializer for login with email and password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret
