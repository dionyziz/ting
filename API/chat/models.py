from django.db import models


class Channel(models.Model):
    def __str__(self):
        return self.name

    name = models.CharField(max_length=20, unique=True)


class Message(models.Model):
    def __str__(self):
        return self.text

    def to_dict(self):
        return {
            'text': self.text,
            'datetime_start': self.datetime_start,
            'datetime_sent': getattr(self, 'datetime_sent', False),
            'username': self.username
        }

    text = models.TextField(max_length=2000)
    datetime_start = models.DateTimeField(default=None)
    datetime_sent = models.DateTimeField(default=None, null=True)
    typing = models.BooleanField(default=False)
    username = models.CharField(max_length=20)
    channel = models.ForeignKey(Channel)
