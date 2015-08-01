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
            'datetime': self.datetime,
            'username': self.username
        }

    text = models.TextField(max_length=2000)
    datetime = models.DateTimeField()
    username = models.CharField(max_length=20)
    channel = models.ForeignKey(Channel)
