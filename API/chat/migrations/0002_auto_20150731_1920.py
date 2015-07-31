# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_squashed_0002_auto_20150707_1647'),
    ]

    operations = [
        migrations.AlterField(
            model_name='channel',
            name='name',
            field=models.CharField(unique=True, max_length=20),
        ),
    ]
