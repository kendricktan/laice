from django.db import models

# Our story
class Story(models.Model):
    name = models.CharField(max_length=128, unique=True)

# Each story has a set of attributes
class StoryAttribute(models.Model):
    story = models.ForeignKey(Story)
    attribute = models.CharField(max_length=128, null=False)