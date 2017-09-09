const React = require('react'),
      _ = require('lodash');

const Select = React.createClass({
    render() {
        var elements = null,
            options = null;

        if (this.props.start != null) {
            if (this.props.start < this.props.end) {
                elements = _.range(this.props.start, this.props.end + 1);
            }
            else {
                elements = _.rangeRight(this.props.end, this.props.start + 1);
            }
        }
        else {
            elements = this.props.container;
        }

        if (elements != null) {
            options = elements.map(function(elem, ind) {
                return <option key={ind}>{elem}</option>;
            });
        }

        var classProp = 'form-control ' + this.props.classProp,
            idProp = this.props.idProp;

        return (
            <select className={classProp} id={idProp}>
                {options}
            </select>
        );
    }
});

module.exports = Select;
