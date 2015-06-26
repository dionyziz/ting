import time

from django import forms
from .models import Message
from .utils import timestamp_to_datetime


class MessageCreationForm(forms.Form):
    text = forms.CharField(widget=forms.Textarea)
    username = forms.CharField(max_length=20)
    datetime = forms.IntegerField()

    def save(self):
        now = int(round(time.time() * 1000))
        timestamp = self.data['datetime']
        if now < timestamp:
            timestamp = now

        datetime_field = timestamp_to_datetime(timestamp)

        message = Message(
            text=self.data['text'],
            username=self.data['username'],
            datetime=datetime_field,
            channel=self.channel
        )
        message.save()
