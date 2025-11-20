from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager


class Block(models.Model):
    """
    Represents a climbing problem (boulder or rute) where each block can define
    its own scoring options (ScoreOption).
    """
    # --------------------------- Block Types ----------------------------------
    BOULDER = 'boulder'
    RUTA = 'ruta'

    BLOCK_TYPES = [
        (BOULDER, 'Boulder'),
        (RUTA, 'Ruta'),
    ]
    # --------------------------------------------------------------------------
    lane = models.CharField(max_length=50)
    grade = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=20, blank=True)
    wall = models.CharField(max_length=50, blank=True)
    distance = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    block_type = models.CharField(
        max_length=10, choices=BLOCK_TYPES, default=RUTA
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.block_type} - {self.lane} "


class ScoreOption(models.Model):
    """
    Score options defined per block/route.

    Example values: 'flash', 'second try', 'third try', 'more'. Each instance
    belongs to a block/route and you can create exactly the 4 options you
    need when creating/editing a block. This allows flexible scoring per block.
    The more tries it takes to complete the block, the fewer points are awarded.
    0 points can be used for "more".
    """
    block = models.ForeignKey(
        Block, related_name='score_options', on_delete=models.CASCADE
    )
    # Key is a slug to identify the option internally 
    # ('flash', 'segundo', 'tercero', 'mas')
    key = models.SlugField(max_length=30)
    # Human-readable label for display
    label = models.CharField(max_length=50)
    points = models.IntegerField(default=0)
    # Order for displaying options
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = (('block', 'key'),)
        ordering = ['order', 'label']

    def __str__(self):
        return f"{self.block.block_type} - {self.block.lane} - {self.label}"

class CustomUserManager(BaseUserManager):
    """
    CUSTOM user manager to handle creation of users and super users
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es un campo obligatorio.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('age', 999)
        extra_fields.setdefault('cup', 'kids')
        extra_fields.setdefault('score', 9999)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Participant(AbstractUser):
    """
    Represents a participant in the iRock climbing competition.
    """
    # ---------------------- Competition categories ----------------------------
    KIDS = 'kids'
    PRINCIPIANTE = 'principiante'
    INTERMEDIO = 'intermedio'
    AVANZADO = 'avanzado'

    CUP_CHOICES = [
        (KIDS, 'Kids'),
        (PRINCIPIANTE, 'Principiante'),
        (INTERMEDIO, 'Intermedio'),
        (AVANZADO, 'Avanzado'),
    ]
    # --------------------------------------------------------------------------

    # ------------------------------ Gender ------------------------------------
    MALE = 'M'
    FEMALE = 'F'
    OTHER = 'O'
    PREFER_NOT_TO_SAY = 'N'

    GENDER_CHOICES = [
        (MALE, 'Masculino'),
        (FEMALE, 'Femenino'),
        (OTHER, 'Otro'),
        (PREFER_NOT_TO_SAY, 'Prefiero no decirlo'),
    ]
    # --------------------------------------------------------------------------

    age = models.IntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(max_length=100, unique=True, blank=False)
    username = models.CharField(max_length=25, unique=True, blank=False)
    phone = models.CharField(max_length=15, blank=True)
    cup = models.CharField(max_length=12, choices=CUP_CHOICES, default=KIDS)
    registered_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    gender = models.CharField(max_length=50, choices=GENDER_CHOICES, blank=True)
    distance_climbed = models.PositiveIntegerField(default=0)
    
    # Override is_active from AbstractUser to default to False
    # New users must be activated by an admin to keep control over who
    # can participate in the competition (only ppl who paid the fee).
    is_active = models.BooleanField(default=False)

    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email}"

class BlockScore(models.Model):
    """
    Table that links a participant, a block, and the chosen score 
    option (ScoreOption). Thus each block has its own set of options, and the
    records reference the specific option.
    """
    participant = models.ForeignKey(
        Participant, on_delete=models.CASCADE, related_name='block_scores'
    )
    block = models.ForeignKey(
        Block, on_delete=models.CASCADE, related_name='scores'
    )
    score_option = models.ForeignKey(ScoreOption, on_delete=models.PROTECT)
    earned_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Av`oid duplicates: a participant can only have one entry per block
        constraints = [
            models.UniqueConstraint(
                fields=['participant', 'block'], name='unique_participant_block'
            )
        ]

    def clean(self):
        # This method is called to validate the model instance
        if self.score_option_id and self.block_id:
            if self.score_option.block_id != self.block_id:
                raise ValidationError(
                    "La opción de score no pertenece al bloque indicado."
                )

    def save(self, *args, **kwargs):
        # Check if this is an update (existing object)
        is_update = self.pk is not None
        old_earned_points = 0
        old_block_distance = 0
        
        if is_update:
            # Get the old earned_points and distance before updating
            try:
                old_instance = BlockScore.objects.get(pk=self.pk)
                old_earned_points = old_instance.earned_points
                old_block_distance = old_instance.block.distance
            except BlockScore.DoesNotExist:
                old_earned_points = 0
                old_block_distance = 0
        
        # Auto-calculate earned_points from score_option
        if self.score_option:
            self.earned_points = self.score_option.points
        
        # full_clean() -> clean() -> save
        self.full_clean()
        super().save(*args, **kwargs)
        
        # Update participant's total score and distance
        if is_update:
            # Remove old points and add new points
            points_difference = self.earned_points - old_earned_points
            self.participant.score += points_difference
            
            # Update distance only if block changed
            if old_block_distance != self.block.distance:
                distance_difference = self.block.distance - old_block_distance
                self.participant.distance_climbed += distance_difference
        else:
            # New BlockScore, add points and distance
            self.participant.score += self.earned_points
            self.participant.distance_climbed += self.block.distance
        
        self.participant.save(update_fields=['score', 'distance_climbed'])
    
    def delete(self, *args, **kwargs):
        # Subtract earned_points and distance from participant before deleting
        self.participant.score -= self.earned_points
        self.participant.distance_climbed -= self.block.distance
        self.participant.save(update_fields=['score', 'distance_climbed'])
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.participant.email}- \
            {self.block.lane} -> {self.score_option.key}"

