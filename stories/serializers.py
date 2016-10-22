from stories.models import (
    Story,
    StoryAttribute
)
from rest_framework import serializers


class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ('name', 'unconfigured_requests')


class InputStoryAttributeSerializer(serializers.ModelSerializer):
    story = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Story.objects.all()
    )

    class Meta:
        model = StoryAttribute


class StoryAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryAttribute
        fields = ('attribute', )
