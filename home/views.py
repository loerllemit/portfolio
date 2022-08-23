from django.shortcuts import render, HttpResponse

# Create your views here.


def home(request):
    # return HttpResponse("This is my homepage (/) ")
    context = {"name": "Harry", "course": "Django"}
    return render(request, "home.html", context)


def about(request):
    # return HttpResponse("This is my about page(/about) ")
    return render(request, "about.html")


def projects(request):
    # return HttpResponse("This is my projects page (/projects) ")
    return render(request, "projects.html")


def contact(request):
    # return HttpResponse("This is my contact page (/contact) ")
    return render(request, "contact.html")
