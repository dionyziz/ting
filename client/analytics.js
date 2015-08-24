var Analytics = {
    firstMessage: true,
    init() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-64452066-1', 'auto');
        ga('send', 'pageview');
    },
    onMessageSubmit(message) {
        if (this.firstMessage) {
            ga('send', 'event', {
                eventCategory: 'chat',
                eventAction: 'chat_form_submit',
                eventLabel: 'send',
                eventValue: 1
            });
            this.firstMessage = false;
        }
    },
    onLoginIntention(username) {
        ga('send', 'event', {
            eventCategory: 'join',
            eventAction: 'username_set',
            eventLabel: 'submit',
            eventValue: 1
        });
    }
};
