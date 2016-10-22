from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from stories.views import (
    StoryViewSet,
    StoryAttributeViewSet,
)

urlpatterns = [
    url(r'^stories/$', StoryViewSet.list_mapping(), name='story_list'),
    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/$', StoryViewSet.detail_mapping(), name='story_detail'),

    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/attributes/$', StoryAttributeViewSet.list_mapping(),
        name='story_attribute_list'),
    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/attributes/(?P<attribute_name>[A-Za-z0-9]+)/$', StoryAttributeViewSet.detail_mapping(),
        name='story_attribute_detail'),
]
