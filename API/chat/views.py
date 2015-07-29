import json

from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, QueryDict
from django.views.generic import View
from .utils import datetime_to_timestamp

from .models import Channel, Message
from .forms import MessageCreationForm, MessagePatchForm


class MessageView(View):
    def post(self, request, channel_name, *args, **kwargs):
        channel = get_object_or_404(Channel, name=channel_name)

        form = MessageCreationForm(request.POST)

        if not form.is_valid():
            return HttpResponseBadRequest(str(form.errors))

        form.channel = channel
        form.save()

        return HttpResponse(form.message.id)

    def patch(self, request, channel_name, *args, **kwargs):
        qdict = QueryDict(request.body)

        form = MessagePatchForm(qdict)

        if not form.is_valid():
            return HttpResponseBadRequest(str(form.errors))

        form.save()

        return HttpResponse(status=204)

    def get(self, request, channel_name, *args, **kwargs):
        lim = request.GET.get('lim', 100)

        channel = get_object_or_404(Channel, name=channel_name)

        messages = Message.objects.values(
            'text', 'username', 'datetime_start', 'typing', 'id'
        ).filter(channel=channel).order_by('-datetime_start')[:lim]

        # convert datetime_start to UTC epoch milliseconds
        for message in messages:
            message['datetime_start'] = datetime_to_timestamp(message['datetime_start'])

        messages_json = json.dumps(list(messages))

        return HttpResponse(messages_json, content_type='application/json')

    def delete(self, request, channel_name, *args, **kwargs):
        qdict = QueryDict(request.body)

        if 'id' not in qdict:
            return HttpResponseBadRequest()

        message = get_object_or_404(Message, pk=qdict['id'])

        message.delete()

        return HttpResponse(status=204)


class ChannelView(View):
    def post(self, request, *args, **kwargs):
        channel = Channel(name=request.POST['name'])
        channel.save()

        return HttpResponse(status=204)

    def get(self, request, *args, **kwargs):
        queryset = Channel.objects.values('name')
        channel = get_object_or_404(queryset, name=request.GET['name'])

        return HttpResponse(
            json.dumps(channel),
            content_type='application/json'
        )
