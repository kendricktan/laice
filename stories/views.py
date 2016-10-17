from django.shortcuts import render, render_to_response

# Create your views here.
def stories_view(request):
    return render(request, 'stories.html')

def inner_story_view(request, story_name):
    return render(request, 'inner_story.html', {'story_name': story_name})