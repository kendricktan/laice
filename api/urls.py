from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static

from stories.views import (
    StoryViewSet,
    StoryAttributeViewSet,
    QueryViewSet,
    QueryNERViewSet,
    StoryRetrainViewSet
)

urlpatterns = [
    url(r'^stories/$', StoryViewSet.list_mapping(), name='story_list'),
    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/$', StoryViewSet.detail_mapping(), name='story_detail'),

    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/retrain/$', StoryRetrainViewSet.list_mapping(), name='story_retrain'),

    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/attributes/$', StoryAttributeViewSet.list_mapping(),
        name='story_attribute_list'),
    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/attributes/(?P<attribute_name>[A-Za-z0-9]+)/$',
        StoryAttributeViewSet.detail_mapping(),
        name='story_attribute_detail'),

    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/queries/$', QueryViewSet.list_mapping(),
        name='query_list'),
    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/queries/(?P<query_id>[0-9]+)/$', QueryViewSet.detail_mapping(),
        name='query_detail'),

    url(r'^stories/(?P<story_name>[A-Za-z0-9-]+)/queries/(?P<query_id>[0-9]+)/ner/$', QueryNERViewSet.list_mapping(),
        name='query_ner_list'),
]
