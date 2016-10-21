from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, exceptions

from stories.models import Story
from stories.serializers import StorySerializer


# Render views
def stories_view(request):
    return render(request, 'stories.html')


def inner_story_view(request, story_name):
    inner_story = get_object_or_404(Story, name=story_name)
    return render(request, 'inner_story.html', {'story_name': story_name})


# Rest framework ViewSets
class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

    first_key = 'story_name'

    def get_object(self):
        try:
            story = self.queryset.get(name=self.kwargs[self.first_key])
        except (Story.DoesNotExist, ValueError, IndexError):
            raise exceptions.NotFound()
        return story

story_list = StoryViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

story_detail = StoryViewSet.as_view({
    'get': 'retrieve',
    'delete': 'destroy'
})
