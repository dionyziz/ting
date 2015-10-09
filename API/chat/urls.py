from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    url(
        r'^messages/(?P<id>[0-9]+)/$',
        csrf_exempt(views.MessageView.as_view()),
        name='message'
    ),
    url(
        r'^messages/(?P<type>[a-z]+)/(?P<target>[a-zA-Z0-9_.-]+)/$',
        csrf_exempt(views.MessageView.as_view()),
        name='message'
    ),
    url(
        r'^channels/',
        views.ChannelView.as_view(),
        name='channel'
    ),
]
