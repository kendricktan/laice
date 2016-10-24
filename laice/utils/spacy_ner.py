from __future__ import unicode_literals, print_function

import os
import random

import spacy

from spacy.tagger import Tagger
from django.conf import settings
from spacy.gold import GoldParse
from spacy.pipeline import EntityRecognizer

# Load up our Data dir
# NLP Module
nlp = spacy.load('en', parser=False, entity=False, add_vectors=False)

# Quick and easy
nlp.tagger = Tagger(nlp.vocab, features=Tagger.feature_templates)

# Trains our query object
def train_query(queryObj):
    global nlp

    # Our query string
    story = queryObj.story
    querystring = queryObj.querystring
    parsed_ner = queryObj.parsed_ner

    # Where our model is located
    model_path = os.path.normpath( os.path.join( settings.SPACYMODEL_DIR, str( story.name ) ) )

    ENTITY_OFFSETS = []
    ENTITY_LIST = []

    for txt in parsed_ner:
        cur_entity = parsed_ner[txt]
        cur_index = querystring.find( txt )
        # If string is found in querystring
        if cur_index != -1:
            ENTITY_OFFSETS.append( (cur_index, cur_index + len( txt ), cur_entity) )

            # Add entity to entity list if its not in there
            if cur_entity not in ENTITY_LIST:
                ENTITY_LIST.append( cur_entity )

    # Our training data
    TRAIN_DATA = [
        (
            querystring,
            ENTITY_OFFSETS
        ),
    ]

    # Trains the model
    # loads up existing data if they exist
    ner = EntityRecognizer( nlp.vocab, entity_types=ENTITY_LIST )

    # If our model exists, we load it
    if os.path.isfile( model_path ):
        ner.model.load( model_path )

    for itn in range( 5 ):
        random.shuffle( TRAIN_DATA )
        for raw_text, entity_offsets in TRAIN_DATA:
            doc = nlp.make_doc( raw_text )
            gold = GoldParse( doc, entities=entity_offsets )
            ner.update( doc, gold )
    ner.model.end_training( )

    # Save model
    ner.model.dump( model_path )


# Gets our query object
def get_query(queryObj):
    global nlp

    # Our query string
    story = queryObj.story
    querystring = queryObj.querystring

    # Where our model is located
    model_path = os.path.normpath( os.path.join( settings.SPACYMODEL_DIR, str( story.name ) ) )

    ENTITY_LIST = []
    for attribute in story.storyattribute_set.all( ):
        ENTITY_LIST.append( str( attribute.attribute ) )

    # Initialize Spacy modules
    ner = EntityRecognizer( nlp.vocab, entity_types=ENTITY_LIST )

    # Only tag ners if there is an existing dataset
    if os.path.isfile( model_path ):
        ner.model.load( model_path )

        # Creates a tagger
        doc = nlp.make_doc( querystring )

        nlp.tagger( doc )
        ner( doc )

        # Formatted Dic, or in JSON format
        ner_dict = {}

        for word in doc:
            if word.ent_type_ is not None and word.ent_type_ is not '':
                ner_dict[word.text] = word.ent_type_

        # Save dict as our parsed ner
        queryObj.parsed_ner = ner_dict

    # Returns empty dict
    else:
        queryObj.parsed_ner = {}


# Cleans our query object (on deletion)
def clean_story(story):
    # Cleans up models left over by story
    # Where our model is located
    model_path = os.path.normpath( os.path.join( settings.SPACYMODEL_DIR, str( story.name ) ) )

    if os.path.isfile( model_path ):
        os.remove( model_path )
