from django.db import models


# Our story
class Story(models.Model):
    name = models.CharField(max_length=128, unique=True)

    def save(self, *args, **kwargs):
        if self.name:
            self.name = self.name.replace(' ', '')
        super(Story, self).save(*args, **kwargs)


# Each story has a set of attributes
class StoryAttribute(models.Model):
    story = models.ForeignKey(Story)
    attribute = models.CharField(max_length=128, null=False)


# Query model
class Query(models.Model):
    # Querystring
    querystring = models.TextField()

    # Each query will belong to a story
    story = models.ForeignKey(Story)

    # A query can have many attributes
    attribute = models.ManyToManyField(StoryAttribute)
