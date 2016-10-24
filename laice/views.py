from django.shortcuts import render

# Create your views here.
def help_view(request):
    return render(request, 'help.html')

def about_view(request):
    return render(request, 'about.html')