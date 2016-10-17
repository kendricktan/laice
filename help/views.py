from django.shortcuts import render

# Create your views here.
def help_view(request):
    return render(request, 'help.html')