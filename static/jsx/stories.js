/**
 * Created by kendricktan on 21/10/16.
 */
var React = require('react');
var ReactDOM = require('react-dom');

var StoryList = React.createClass({
    render: function () {
        return (
            <tbody>
            {
                this.props.data.stories.map(function (story) {
                    return (
                        <tr>
                            <th scope="row"><a href={story['name']}>{story['name']}</a></th>
                            <td>{story['unconfigured_requests']}</td>
                        </tr>
                    );
                })
            }
            </tbody>
        )
    }
});

var StoryTable = React.createClass({
    getInitialState: function () {
        return {
            data: {
                stories: []
            }
        };
    },

    componentDidMount: function () {
        this.serverRequest = $.get(DOMAIN + 'api' + URL_PATH, function (stories) {
            this.setState({data: {stories: stories}})
        }.bind(this));
    },

    componentWillUnmount: function () {
        this.serverRequest.abort();
    },

    render: function () {
        return (
            <table id="stories-table" className="table">
                <thead>
                <tr>
                    <th>Story</th>
                    <th>Unconfigured requests</th>
                </tr>
                </thead>

                <StoryList data={this.state.data}/>

            </table>
        )
    }
});

ReactDOM.render(
    <StoryTable/>, document.getElementById("div-attribute-table")
);