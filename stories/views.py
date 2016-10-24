from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, exceptions, status
from rest_framework.response import Response

from laice.core.viewsets import ViewMappingMixin
from stories.models import Story
from stories.serializers import (
    StorySerializer,
    StoryAttributeSerializer,
    InputStoryAttributeSerializer,
    QuerySerializer,
    InputQuerySerializer,
    QueryNERSerializer
)
from stories.viewsets import GetStoryMixin


# Render views
def stories_view(request):
    return render(request, 'stories.html')


def inner_story_view(request, story_name):
    inner_story = get_object_or_404(Story, name=story_name)
    return render(request, 'inner-story.html', {'story_name': story_name})


# Rest framework ViewSets
# Story
class StoryViewSet(GetStoryMixin, ViewMappingMixin, viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.queryset, many=True)
        return Response(serializer.data)


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


# Story QuerySet serializer
class QueryViewSet(GetStoryMixin, ViewMappingMixin, viewsets.ModelViewSet):
    queryset = Story.objects.all()

    input_serializer_class = InputQuerySerializer
    output_serializer_class = QuerySerializer
    serializer_class = output_serializer_class

    second_key = 'query_id'

    def create(self, request, *args, **kwargs):
        request_data = request.data.copy()
        request_data['story'] = self.kwargs[self.first_key]
        serializer = self.input_serializer_class(data=request_data)
        serializer.is_valid(raise_exception=True)
        serializer.save() # Because we're using signals, there's a callback function for pre_save
        # We therefore need to reload the instance into serializer
        serializer = self.output_serializer_class(serializer.instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queries = self.get_queries( )
        page = self.paginate_queryset(queries)

        if page is not None:
            serializer = self.output_serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.output_serializer_class(queries, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        query = self.get_query()
        serializer = self.output_serializer_class(query)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        query = self.get_query()
        query.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_query(self):
        queries = self.get_queries( )
        try:
            query = queries.get(pk=self.kwargs[self.second_key])
        except (ObjectDoesNotExist):
            raise exceptions.NotFound()
        return query

    def get_queries(self):
        queries = self.get_object().query_set.all().order_by('-pk')
        return queries


# Query Named entity relationship mapping
class QueryNERViewSet(GetStoryMixin, ViewMappingMixin, viewsets.ModelViewSet):
    list_methods = ['create', 'destroy', 'list']

    queryset = Story.objects.all()
    serializer_class = QueryNERSerializer

    second_key = 'query_id'

    # Create just appends it to the parsed NER
    def create(self, request, *args, **kwargs):
        # Gets the new NER
        ner = self.get_new_ner(data=request.data)

        # ner contains a new attribute that we wanna map to our query
        query = self.get_query()
        query_ner = query.parsed_ner

        if query_ner is None:
            query_ner = {}

        # Map that into the new query_ner
        for key in ner['ner']:
            query_ner[key] = ner['ner'][key]

        query.parsed_ner = query_ner
        query.save()
        # AJAX datatype: json needs a body on 201
        # or else it thinks it failed...
        serializer = self.get_serializer(data=ner)
        serializer.is_valid(raise_exception=True)
        return Response(data=serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        query = self.get_query()
        serializer = self.get_serializer({'ner': query.parsed_ner})
        return Response(serializer.data['ner'])

    def destroy(self, request, *args, **kwargs):
        # Gets the new NER
        ner = self.get_new_ner(data=request.data)

        query = self.get_query()
        query_ner = query.parsed_ner

        if query_ner is None:
            raise exceptions.ValidationError(detail={'Error': 'Can\'t delete empty item'})

        # Pop out keys specified in the ner
        for key in ner['ner']:
            if key in query_ner:
                query_ner.pop(key)

        query.parsed_ner = query_ner
        query.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_new_ner(self, data):
        # Serializing the request
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        ner = serializer.validated_data

        return ner

    def get_query(self):
        story = self.get_object()
        try:
            query = story.query_set.get(id=self.kwargs[self.second_key])
        except (ObjectDoesNotExist):
            raise exceptions.NotFound()
        return query
