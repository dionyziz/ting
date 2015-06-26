# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_squashed_0008_auto_20150702_1437'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='text',
            field=models.TextField(max_length=2000),
        ),
        migrations.AlterField(
            model_name='message',
            name='username',
            field=models.CharField(max_length=20),
        ),
    ]
