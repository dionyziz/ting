from chat.tests.common import *

class ChannelModelTests(ChatTests):
    def test_channel_create(self):
        """
        A channel must be saved in the database.
        """
        channels = Channel.objects.filter(pk=self.channel.id)
        self.assertTrue(channels.exists())
        self.assertEqual(channels.count(), 1)
        self.assertEqual(channels[0].name, self.channel.name)

