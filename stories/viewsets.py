from django.core.exceptions import ObjectDoesNotExist
from rest_framework import exceptions

class GetStoryMixin:
    first_key = 'story_name'

    def get_object(self):
        try:
            story = self.queryset.get(name=self.kwargs[self.first_key])
        except (ObjectDoesNotExist):
            raise exceptions.NotFound()
        return story