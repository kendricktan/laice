/**
 * Created by kendricktan on 21/10/16.
 */
var React = require('react');
var ReactDOM = require('react-dom');

var StoryApp = React.createClass({
    getInitialState: function () {
        return {
            stories: [],
            labelText: ""
        };
    },

    componentDidMount: function () {
        this.serverRequest = $.get('/api' + URL_PATH, function (stories) {
            this.setState({stories: stories});
        }.bind(this));
    },

    componentWillUnmount: function () {
        this.serverRequest.abort();
    },

    handleStoryAdd: function (story) {
        this.setState({labelText: ""});
        this.setState({stories: this.state.stories.concat([story])});
    },

    handleStoryDuplicate: function(){
        this.setState({labelText: "Story name already exists!"});
    },

    render: function () {
        return (
            <div>
                <table id="stories-table" className="table">
                    <thead>
                    <tr>
                        <th>Story</th>
                        <th>Unconfigured requests</th>
                    </tr>
                    </thead>

                    <StoryList stories={this.state.stories}/>
                </table>
                <hr/>
                <p><span className="label label-warning">{this.state.labelText}</span></p>
                <AddStory onDuplicateStory={this.handleStoryDuplicate} onAddStory={this.handleStoryAdd}/>
            </div>
        )
    }
});

var StoryList = React.createClass({
    render: function () {
        var stories = [];
        this.props.stories.map(function(story){
            stories.push(<Story storyName={story.name} storyUnconfiguredCount={story.unconfigured_requests}/>)
        }.bind(this));
        return (
            <tbody>
            { stories }
            </tbody>
        )
    }
});

var Story = React.createClass({
   render: function(){
       return(
           <tr>
               <td><a href={ this.props.storyName }>{ this.props.storyName }</a></td>
               <td>{ this.props.storyUnconfiguredCount }</td>
           </tr>
       );
   }
});

var AddStory = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH,
            type: "POST",
            data: {
                name: this.state.name
            },
            success: function (response) {
                this.props.onAddStory(response);
                this.refs.nameInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onDuplicateStory();
            }.bind(this),
        });
    },

    getInitialState: function () {
        return {
            name: ""
        };
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input ref="nameInput" name="name" type="text" className="form-control"
                       placeholder="Story name (whitespaces will be trimed, special characters will be replaced with '-')"
                       onChange={(e)=>this.setState({name: e.target.value})}/><br/>
                <button id="add-story-btn" type="submit" className="btn btn-block btn-default btn-success">Add</button>
            </form>
        );
    }
});

ReactDOM.render(
    <StoryApp/>, document.getElementById("div-stories-table")
);