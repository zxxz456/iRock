from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginViewSet, ParticipantViewSet, BlockViewSet, \
    BlockScoreViewSet, ScoreOptionViewSet

# ALL backend endpoints here
router = DefaultRouter()
router.register(r'participants', ParticipantViewSet, basename='participant')
router.register(r'blocks', BlockViewSet, basename='block')
router.register(r'blockscores', BlockScoreViewSet, basename='blockscore')
router.register(r'scoreoptions', ScoreOptionViewSet, basename='scoreoption')
router.register(r'login', LoginViewSet, basename='login')

urlpatterns = router.urls
