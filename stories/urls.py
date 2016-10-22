from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from stories.views import (
    stories_view,
    inner_story_view,
)

urlpatterns = [
    url(r'^$', stories_view, name='stories_view'),
    url(r'^(?P<story_name>[A-Za-z0-9_-]+)/$', inner_story_view, name='inner_story_view'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)