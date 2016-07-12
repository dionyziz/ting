from chat.tests.common import *

class ChannelViewPOSTTests(ChatTests):
    def test_create_valid_channel(self):
        """
        When a channel is created the view should
        respond with a 204(No Content) code and save the channel
        in the database.
        """
        response = self.client.post(
            reverse('chat:channel'),
            {'name': 'New_Channel'}
        )

        self.assertTrue(Channel.objects.filter(name='New_Channel').exists())
        self.assertEqual(Channel.objects.filter(name='New_Channel').count(), 1)
        self.assertEqual(response.status_code, 204)

