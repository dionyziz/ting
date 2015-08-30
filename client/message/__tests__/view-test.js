const React = require('react/addons');
const TestUtils = React.addons.TestUtils;

jest.dontMock('../view.jsx');

const Message = require('../view.jsx');

describe('Message', function() {
    it('renders a message', function() {
        const message = TestUtils.renderIntoDocument(
            <Message username='hilbert'
                     own='false'
                     text='Wir müssen wissen — wir werden wissen!' />
        );

        const li = TestUtils.findRenderedDOMComponentWithTag(
            message,
            'li'
        ).getDOMNode();

        expect(li.textContent).toContain('hilbert');
    });
});
