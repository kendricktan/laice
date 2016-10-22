from django.apps import AppConfig


class StoriesConfig(AppConfig):
    name = 'stories'

    def ready(self):
        from stories import signals