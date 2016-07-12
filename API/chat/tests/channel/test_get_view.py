from chat.tests.common import *

class ChannelViewGETTests(ChatTests):
    def test_request_valid_channel(self):
        """
        When a channel with a name that exists in
        the database is requested, the view should return
        a JSON object containing the name of the channel
        and a 200(OK) status code.
        """
        response = self.client.get(
            reverse('chat:channel'),
            {'name': self.channel.name}
        )
        returned_channel = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(returned_channel['name'], self.channel.name)

    def test_request_channel_that_does_not_exist(self):
        """
        When a channel that does not exist is requested
        the view should return a 404(Not Found) status code.
        """
        response = self.client.get(
            reverse('chat:channel'),
            {'name': 'invalid_channel'}
        )

        self.assertEqual(response.status_code, 404)

