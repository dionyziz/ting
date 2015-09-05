# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_auto_20150902_1854'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='datetime_start',
            field=models.DateTimeField(default=None),
        ),
    ]
