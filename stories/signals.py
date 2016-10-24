from django.db.models.signals import pre_save, pre_delete
from django.dispatch import receiver
from django.conf import settings
from laice.utils import spacy_ner

from stories.models import Query, Story

@receiver(pre_save, sender=Query)
def parse_ner(sender, instance, *args, **kwargs):
    """
    Callback function that occurs whenever a Query
    object is created. Used to parse NER
    """

    # If its being created, it is assumed that it wants
    # to be automatically parsed
    if instance.pk is None:
        # Remember that key is the text
        # and the dict[key] contains the attribute (or entity)
        print('Query created for ', str(instance))
        spacy_ner.get_query(instance)

    # If its being updated, it is assumed that it wants
    # to be manually parsed and should be fed back into
    # the training data
    else:
        instance.configured = True
        print('Query updated for ', str(instance))
        spacy_ner.train_query(instance)