from stories.models import (
    Story,
    Query,
    StoryAttribute
)
from rest_framework import serializers


class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ('name', 'training', 'unconfigured_requests')


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
        fields = ('attribute',)


class InputQuerySerializer(serializers.ModelSerializer):
    story = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Story.objects.all()
    )

    class Meta:
        model = Query
        fields = ('id', 'querystring', 'story')


class QuerySerializer(serializers.ModelSerializer):
    parsed_ner = serializers.DictField()

    class Meta:
        model = Query
        fields = ('id', 'querystring', 'configured', 'parsed_ner')


class QueryNERSerializer(serializers.Serializer):
    ner = serializers.DictField()

    class Meta:
        fields = ('parsed_ner',)
