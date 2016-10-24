from django.shortcuts import render
from stories.models import Story, Query

# Create your views here.
def dashboard_view(request):
    return render(request, 'dashboard.html', {
        'story_number': Story.objects.all().count(),
        'query_number': Query.objects.all().count()
    })