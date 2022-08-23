from django.shortcuts import render, HttpResponse
from django.views.generic import View
from django.http import JsonResponse
from random import randint
import json


# class AjaxHandler(View):
#     def get(self, request):
#         number = randint(1, 10)

#         if request.headers.get("X-Requested-With") == "XMLHttpRequest":
#             return JsonResponse({"number": number})

#         return render(request, "crypto.html")

#     def post(self, request):
#         data = json.loads(request.body)
#         float_number = float(data["number"])
#         return JsonResponse({"float": f"You got:{float_number}"})

# return render(request, "crypto.html")


def crypto(request):
    return render(request, "crypto.html")
    # return HttpResponse("This is my contact page (/contact) ")
