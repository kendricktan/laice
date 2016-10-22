from laice.core.viewsets import ViewMappingMixin

from django.shortcuts import render, get_object_or_404, HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, exceptions, status
from rest_framework.response import Response

from stories.viewsets import GetStoryMixin
from stories.models import Story, StoryAttribute
from stories.serializers import (
    StorySerializer,
    StoryAttributeSerializer,
    InputStoryAttributeSerializer
)


# Render views
def stories_view(request):
    return render(request, 'stories.html')


def inner_story_view(request, story_name):
    inner_story = get_object_or_404(Story, name=story_name)
    return render(request, 'inner_story.html', {'story_name': story_name})


# Rest framework ViewSets
# Story
class StoryViewSet(GetStoryMixin, ViewMappingMixin, viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer


# Story Attributes
class StoryAttributeViewSet(GetStoryMixin, ViewMappingMixin, viewsets.ModelViewSet):
    queryset = Story.objects.all()

    input_serializer_class = InputStoryAttributeSerializer
    output_serializer_class = StoryAttributeSerializer
    serializer_class = output_serializer_class

    second_key = 'attribute_name'

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        request_data['story'] = self.kwargs[self.first_key]
        serializer = self.input_serializer_class(data=request_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        attribute = self.get_attribute()
        serializer = self.output_serializer_class(attribute)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        attributes = self.get_attributes()
        serializer = self.output_serializer_class(attributes, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        attribute = self.get_attribute()
        attribute.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_attribute(self):
        attributes = self.get_attributes()
        try:
            attribute = attributes.get(attribute=self.kwargs[self.second_key])
        except (ObjectDoesNotExist):
            raise exceptions.NotFound()
        return attribute

    def get_attributes(self):
        story = self.get_object()
        return story.storyattribute_set.all()