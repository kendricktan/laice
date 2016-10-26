from django.db import models
from annoying.fields import JSONField

from rest_framework import exceptions


# Our story
class Story(models.Model):
    name = models.CharField(
        max_length=128,
        unique=True,
    )

    training = models.BooleanField(default=False)

    @property
    def unconfigured_requests(self):
        return self.query_set.filter(configured=False).count()

    def perform_clean(self):
        if self.name:
            # Replace whitespaces
            self.name = self.name.replace(' ', '')

            # Replace special characters with '-'
            self.name = map(lambda x: x if (x.isalnum() or x == '-') else '-', self.name)
            self.name = ''.join(self.name)

    def save(self, *args, **kwargs):
        self.perform_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# Each story has a set of attributes
class StoryAttribute(models.Model):
    story = models.ForeignKey(Story, null=False)
    attribute = models.CharField(
        max_length=128,
        null=False
    )

    def perform_clean(self):
        if self.attribute:
            # Replace whitespaces
            self.attribute = self.attribute.replace(' ', '')

            # Only accepts alpha numeric
            self.attribute = map(lambda x: x if x.isalnum() else '', self.attribute)
            self.attribute = ''.join(self.attribute)

        # Check if story has similar name
        if self.story:
            # If something exists
            if StoryAttribute.objects.filter(attribute=self.attribute, story=self.story):
                raise exceptions.ValidationError(detail={'attribute': 'story already has an attribute of the same name'})

    def save(self, *args, **kwargs):
        self.perform_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete saved model here
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.attribute + ' | ' + str(self.story)


# Query model
class Query(models.Model):
    # Querystring
    querystring = models.TextField()

    # Each query will belong to a story
    story = models.ForeignKey(Story, null=False)

    # Has the querystring been configured
    # by configured I mean manually parsed
    configured = models.BooleanField(default=False)

    # Store it's named entity recognizier via Spacy
    parsed_ner = JSONField(blank=True, null=True)

    def __str__(self):
        return self.querystring + ' | ' + str(self.story)