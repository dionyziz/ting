import json

from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, QueryDict
from django.views.generic import View
from .utils import datetime_to_timestamp

from .models import Channel, Message
from .forms import MessageCreationForm, MessagePatchForm


class MessageView(View):
    def post(self, request, type, target, *args, **kwargs):
        # currently `type` is always 'channel'
        channel = get_object_or_404(Channel, name=target)

        form = MessageCreationForm(request.POST)

        if not form.is_valid():
            return HttpResponseBadRequest(str(form.errors))

        form.channel = channel
        message = form.save()

        return HttpResponse(message.id)

    def patch(self, request, id, *args, **kwargs):
        qdict = QueryDict(request.body)

        message = Message.objects.get(pk=id)

        form = MessagePatchForm(qdict)

        if not form.is_valid() or not message.typing:
            return HttpResponseBadRequest(str(form.errors))

        form.save(message)

        return HttpResponse(status=204)

    def get(self, request, type, target, *args, **kwargs):
        lim = request.GET.get('lim', 100)

        # currently `type` is always 'channel'
        channel = get_object_or_404(Channel, name=target)

        messages = Message.objects.values(
            'text', 'username', 'datetime_start', 'typing', 'id', 'datetime_sent'
        ).filter(channel=channel).order_by('-id')[:lim]

        # convert datetime_start to UTC epoch milliseconds
        for message in messages:
            message['datetime_start'] = datetime_to_timestamp(message['datetime_start'])
            if message['datetime_sent']:
                message['datetime_sent'] = datetime_to_timestamp(message['datetime_sent'])

        messages_json = json.dumps(list(messages))

        return HttpResponse(messages_json, content_type='application/json')

    def delete(self, request, id, *args, **kwargs):
        message = get_object_or_404(Message, pk=id)

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
