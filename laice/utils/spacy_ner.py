from __future__ import unicode_literals, print_function
import json
import pathlib
import random

import spacy
from spacy.pipeline import EntityRecognizer
from spacy.gold import GoldParse


def train_ner(nlp, train_data, entity_types):
    ner = EntityRecognizer(nlp.vocab, entity_types=entity_types)
    for itn in range(15):
        random.shuffle(train_data)
        for raw_text, entity_offsets in train_data:
            doc = nlp.make_doc(raw_text)
            gold = GoldParse(doc, entities=entity_offsets)
            ner.update(doc, gold)
    ner.model.end_training()
    return ner


def get_ner(phrase, model_dir=None):
    if model_dir is not None:
        model_dir = pathlib.Path(model_dir)
        if not model_dir.exists():
            model_dir.mkdir()
        assert model_dir.is_dir()

    nlp = spacy.load('en', parser=False, entity=False, vectors=False)

    train_data = [
        (
            'Get me some pens',
            [(len(''), len('Get'), 'ACTION'),
             (len('Get me some '), len('Get me some pens'), 'OBJ')]
        ),
        (
            'Get me some potatoes',
            [(len(''), len('Get'), 'ACTION'),
             (len('Get me some '), len('Get me some potatoes'), 'OBJ')]
        ),
        (
            'Get me a piece of paper',
            [(len(''), len('Get'), 'ACTION'),
             (len('Get me a piece of '), len('Get me a piece of paper'), 'OBJ')]
        ),
        (
            'Give me those cookies',
            [(len(''), len('Give'), 'ACTION'),
             (len('Give me those '), len('Give me those cookies'), 'OBJ')]
        )
    ]
    ner = train_ner(nlp, train_data, ['ACTION', 'OBJ'])

    doc = nlp.make_doc(phrase)
    nlp.tagger(doc)
    ner(doc)

    # Formatted Dic, or in JSON format
    output_dict = {}

    for word in doc:
        if word.ent_type_ is not None and word.ent_type_ is not '':
            output_dict[word.ent_type_] = word.text

    import pprint

    pprint.pprint(output_dict)

    # Save model?
    if model_dir is not None:
        with (model_dir / 'config.json').open('w') as file_:
            json.dump(ner.cfg, file_)
        ner.model.dump(str(model_dir / 'model'))

def get_ner_from_load(phrase, model_dir=None):
    if model_dir is not None:
        model_dir = pathlib.Path(model_dir)
        if not model_dir.exists():
            model_dir.mkdir()
        assert model_dir.is_dir()

    nlp = spacy.load('en', parser=False, entity=False, vectors=False)
    ner = EntityRecognizer(nlp.vocab, entity_types=['ACTION', 'OBJ'])
    ner.model.load(str(model_dir / 'model'))

    doc = nlp.make_doc(phrase)
    nlp.tagger(doc)
    ner(doc)

    # Formatted Dic, or in JSON format
    output_dict = {}

    for word in doc:
        if word.ent_type_ is not None and word.ent_type_ is not '':
            output_dict[word.ent_type_] = word.text

    import pprint

    pprint.pprint(output_dict)


if __name__ == '__main__':
    get_ner('Give me those bottles', 'new_model')
    get_ner_from_load('Give me those bottles' ,'new_model')
