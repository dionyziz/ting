import time

from django import forms
from .models import Message
from .utils import timestamp_to_datetime, datetime_to_timestamp


class MessageCreationForm(forms.Form):
    text = forms.CharField(widget=forms.Textarea)
    username = forms.CharField(max_length=20)
    datetime_start = forms.IntegerField()
    typing = forms.BooleanField()

    def save(self):
        now = int(round(time.time() * 1000))
        timestamp = int(self.data['datetime_start'])
        if now < timestamp:
            timestamp = now

        datetime_start_field = timestamp_to_datetime(timestamp)

        message = Message.objects.create(
            text=self.data['text'],
            username=self.data['username'],
            datetime_start=datetime_start_field,
            typing=self.data['typing'],
            channel=self.channel
        )
        self.message = message

        if not message.typing:
            message.datetime_sent = message.datetime_start
            message.save()


class MessagePatchForm(forms.Form):
    id = forms.IntegerField()
    text = forms.CharField(widget=forms.Textarea)
    datetime_sent = forms.IntegerField()
    typing = forms.BooleanField(required=False, initial=False)

    def save(self):
        message = Message.objects.get(pk=self.data['id'])

        timestamp_start = datetime_to_timestamp(message.datetime_start)
        timestamp_sent = int(self.data['datetime_sent'])

        if timestamp_sent < timestamp_start:
            timestamp_sent = timestamp_start

        message.datetime_sent = timestamp_to_datetime(timestamp_sent)
        message.text = self.data['text']
        message.typing = self.data.get('typing', False)
        # because django doesn't convert 'False' to False
        if message.typing == 'false' or message.typing == 'False':
            message.typing = False

        message.save()

        self.message = message
