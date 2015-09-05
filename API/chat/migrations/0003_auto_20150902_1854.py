# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_auto_20150731_1920'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='datetime',
            new_name='datetime_start'
        ),
        migrations.AddField(
            model_name='message',
            name='datetime_sent',
            field=models.DateTimeField(default=None, null=True),
        ),
        migrations.AddField(
            model_name='message',
            name='typing',
            field=models.BooleanField(default=False),
        ),
    ]
