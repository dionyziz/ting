import time

from django import forms
from .models import Message
from .utils import timestamp_to_datetime, datetime_to_timestamp



class MessageForm(forms.Form):
    text = forms.CharField(widget=forms.Textarea)
    typing = forms.BooleanField(required=False)


class MessageCreationForm(MessageForm):
    username = forms.CharField(max_length=20)
    datetime_start = forms.IntegerField()

    def clean_datetime_start(self):
        now = int(round(time.time() * 1000))
        timestamp = int(self.data['datetime_start'])
        if now < timestamp:
            timestamp = now

        self.cleaned_data['datetime_start'] = timestamp_to_datetime(timestamp)

    def save(self):
        self.clean_datetime_start()

        message = Message.objects.create(channel=self.channel, **self.cleaned_data)

        if not message.typing:
            message.datetime_sent = message.datetime_start
            message.save()

        return message;


class MessagePatchForm(MessageForm):
    datetime_sent = forms.IntegerField()

    def save(self, message):
        timestamp_start = datetime_to_timestamp(message.datetime_start)
        timestamp_sent = int(self.cleaned_data['datetime_sent'])

        if timestamp_sent < timestamp_start:
            timestamp_sent = timestamp_start

        message.datetime_sent = timestamp_to_datetime(timestamp_sent)
        message.text = self.cleaned_data['text']
        message.typing = self.cleaned_data.get('typing', False)

        message.save()
