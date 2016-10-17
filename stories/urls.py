from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    url(r'^$', views.stories_view, name='stories_view'),
    url(r'^(?P<story_name>[a-zA-Z0-9]+)/?$', views.inner_story_view, name='inner_story_view'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)