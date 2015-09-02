import time

from django import forms
from .models import Message
from .utils import timestamp_to_datetime


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

        message = Message(
            text=self.data['text'],
            username=self.data['username'],
            datetime_start=datetime_start_field,
            typing=self.data['typing'],
            channel=self.channel
        )
        message.save()
        self.message = message
