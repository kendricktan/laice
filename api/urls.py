from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from stories.views import (
    story_detail,
    story_list
)

urlpatterns = [
    url(r'^stories/?$', story_list, name='story_list'),
    url(r'^stories/(?P<story_name>[a-zA-Z0-9]+)/?$', story_detail, name='story_detail'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)