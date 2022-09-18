from django.shortcuts import render, HttpResponse

# Create your views here.


def home(request):
    context = {"name": "Christian", "course": "Django"}
    return render(request, "home/home.html", context)


def resume(request):
    return render(request, "resume.html")


def projects(request):
    return render(request, "projects.html")


# def screener(request):
## return HttpResponse("This is my contact page (/contact) ")
## return render(request, "contact.html")
