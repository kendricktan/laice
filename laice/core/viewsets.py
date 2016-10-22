class ViewMappingMixin:
    list_methods = ['list', 'create']
    detail_methods = ['retrieve', 'destroy']

    protocol_mapping = {
        'create': 'post',
        'retrieve': 'get',
        'list': 'get',
        'partial_update': 'patch',
        'update': 'patch',
        'destroy': 'delete'
    }

    @classmethod
    def list_mapping(cls):
        return cls.as_view(dict((cls.protocol_mapping[key], key) for key in cls.list_methods))

    @classmethod
    def detail_mapping(cls):
        return cls.as_view(dict((cls.protocol_mapping[key], key) for key in cls.detail_methods))
