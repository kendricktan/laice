from django.db.models.signals import post_save
from django.dispatch import receiver

from stories.models import Query

@receiver(post_save, sender=Query)
def parse_ner(sender, instance, created, **kwargs):
    """
    Callback function that occurs whenever a Query
    object is created. Used to parse NER
    """

    # If its being created, it is assumed that it wants
    # to be automatically parsed
    if created:
        print('Query created for ', str(instance))

    # If its being updated, it is assumed that it wants
    # to be manually parsed and should be fed back into
    # the training data
    elif not created:
        print('Query updated for ', str(instance))