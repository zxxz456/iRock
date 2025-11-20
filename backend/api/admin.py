from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.forms import ModelForm
from .models import Block, ScoreOption, Participant, BlockScore

class ScoreOptionInline(admin.TabularInline):
    """
    Inline for directly creating/editing support. (admin interface)
    """
    model = ScoreOption
    extra = 1
    fields = ('key', 'label', 'order', 'points')

@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('lane', 'grade', 'color', 'wall', 'block_type', 
                    'active', 'created_at', 'distance')
    search_fields = ('lane', 'grade')
    inlines = [ScoreOptionInline]

@admin.register(ScoreOption)
class ScoreOptionAdmin(admin.ModelAdmin):
    list_display = ('block', 'key', 'label', 'order', 'points')
    list_filter = ('block',)
    # FOregin key lookup with "__"
    search_fields = ('key', 'label', 'block__lane')

class BlockScoreForm(ModelForm):
    """
    Personalized form that filters score_option
    according to the selected block.
    """
    
    class Meta:
        model = BlockScore
        fields = ['participant', 'block', 'score_option']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter score_option based on block
        if self.instance.block_id:
            self.fields['score_option'].queryset = ScoreOption.objects.filter(
                block_id=self.instance.block_id
            )
        else:
            # If no block is selected, show all options (or could be empty)
            self.fields['score_option'].queryset = ScoreOption.objects.all()

@admin.register(BlockScore)
class BlockScoreAdmin(admin.ModelAdmin):
    form = BlockScoreForm
    list_display = ('participant', 'block', 'score_option', 'created_at')
    list_filter = ('block', 'created_at')
    search_fields = ('participant__name', 'block__lane', 'score_option__label')
    readonly_fields = ('created_at',)

    def get_form(self, request, obj=None, **kwargs):
        """Personalizar form para filtrar score_option."""
        form = super().get_form(request, obj, **kwargs)
        
        # Filtrar score_option según el block
        if obj and obj.block_id:
            form.base_fields['score_option'].queryset = \
            ScoreOption.objects.filter(
                block_id=obj.block_id
            )
        
        return form

@admin.register(Participant)
class ParticipantAdmin(UserAdmin):
    """
    Custom admin for Participant model that properly handles password hashing.
    """
    # Fields to display in the list view
    list_display = ('email', 'username', 'first_name', 'last_name', 'cup', 
                    'age', 'score', 'is_staff', 'is_active', 'registered_at')
    list_filter = ('cup', 'is_staff', 'is_active', 'registered_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    readonly_fields = ('registered_at', 'score', 'distance_climbed')
    
    # Fields for editing an existing user
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'age', 
                                      'phone', 'cup')}),
        ('Climbing Stats', {'fields': ('score', 'distance_climbed')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 
                                    'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'registered_at')}),
    )
    
    # Fields for creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'age', 
                       'phone', 'cup', 'password1', 'password2', 'is_active', 
                       'is_staff', 'is_superuser'),
        }),
    )
    
    ordering = ('email',)