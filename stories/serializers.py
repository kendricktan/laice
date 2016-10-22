from stories.models import (
    Story,
    Query,
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
        fields = ('attribute',)


class InputQuerySerializer(serializers.ModelSerializer):
    story = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Story.objects.all()
    )

    attributes = serializers.SlugRelatedField(
        slug_field='id',
        queryset=StoryAttribute.objects.all(),
        required=False,
        many=True
    )

    class Meta:
        model = Query
        fields = ('querystring', 'story', 'attributes',)


class QuerySerializer(serializers.ModelSerializer):
    attributes = StoryAttributeSerializer(many=True)
    parsed_ner = serializers.DictField()

    class Meta:
        model = Query
        fields = ('querystring', 'attributes', 'configured', 'parsed_ner')
