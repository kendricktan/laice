/**
 * Created by kendricktan on 22/10/16.
 */
var React = require("react");
var ReactDOM = require("react-dom");

/* Inner story Header */
var InnerStoryHeader = React.createClass({
    onDeleteStory: function () {
        $.ajax({
            url: "/api" + URL_PATH,
            type: 'DELETE',
            success: function (response) {
                window.location.replace(DOMAIN + STORY_URL);
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    render: function () {
        return (
            <h3>
                <button type="button" className="pull-right btn btn-danger" data-toggle="modal"
                        data-target="#delete-story-modal">
                    Delete Story
                </button>
                <div className="modal fade" id="delete-story-modal" tabindex="-1" role="dialog"
                     aria-labelledby="myModalLabel">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                                    aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title" id="myModalLabel">Delete story?</h4>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-danger" onClick={this.onDeleteStory}>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <a href={STORY_URL}>Stories</a>
                &nbsp; &gt; &nbsp;
                <a href={STORY_URL + STORY_NAME}>{STORY_NAME}</a>
            </h3>
        )
    }
});

ReactDOM.render(
    <InnerStoryHeader/>, document.getElementById("div-story-header")
);

/* Attributes */
var AttributeApp = React.createClass({
    getInitialState: function () {
        return {
            attributeList: [],
            labelText: ""
        };
    },

    componentDidMount: function () {
        this.serverRequest = $.get("/api" + URL_PATH + "attributes/", function (attributes) {
            this.setState({attributeList: attributes})
        }.bind(this));
    },

    handleAttributeSubmit: function (attr) {
        this.setState({labelText: ""});
        this.setState({attributeList: this.state.attributeList.concat([attr])});
    },

    handleAttributeRemove: function (attributeName) {
        var newAttributeList = this.state.attributeList.filter(function (a) {
            return a.attribute != attributeName;
        });
        this.setState({attributeList: newAttributeList});
    },

    handleAttributeDuplicate: function () {
        this.setState({labelText: "Attribute name already exists!"});
    },

    render: function () {
        return (
            <div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <AttributeList attributeList={this.state.attributeList}
                                   onAttributeRemove={this.handleAttributeRemove}/>
                </table>
                <hr/>
                <p><span className="label label-warning">{this.state.labelText}</span></p>
                <NewAttribute onAttributeDuplicate={this.handleAttributeDuplicate}
                              onAttributeSubmit={this.handleAttributeSubmit}/>
            </div>
        );
    }
});

var AttributeList = React.createClass({
    handleAttributeRemove: function (attributeName) {
        $.ajax({
            url: "/api" + URL_PATH + "attributes/" + attributeName,
            type: 'DELETE',
            success: function (response) {
                this.props.onAttributeRemove(attributeName);
            }.bind(this),
            error: function (response) {
                console.log(response);
            }
        });
    },

    render: function () {
        var attributes = [];
        this.props.attributeList.map(function (attribute) {
            attributes.push(<Attribute attributeName={attribute.attribute}
                                       onAttributeDelete={this.handleAttributeRemove}/>);
        }.bind(this));
        return (
            <tbody>
            { attributes }
            </tbody>
        );
    }
});

var Attribute = React.createClass({
    handleAttributeRemove: function (attributeName) {
        this.props.onAttributeDelete(this.props.attributeName);
    },

    render: function () {
        return (
            <tr>
                <td>{ this.props.attributeName }</td>
                <td>
                    <button type="button" className="btn btn-danger"
                            onClick={this.handleAttributeRemove}>
                        Delete
                    </button>
                </td>
            </tr>
        );
    }
});

var NewAttribute = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH + "attributes/",
            type: "POST",
            data: {
                attribute: this.state.attribute
            },
            success: function (response) {
                this.props.onAttributeSubmit(response);
                this.refs.attributeInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onAttributeDuplicate();
            }.bind(this)
        });
    },

    getInitialState: function () {
        return {
            attribute: ""
        };
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input ref="attributeInput" name="attribute" type="text" className="form-control"
                       placeholder="Story name (whitespaces will be trimed, special characters will be replaced with '-')"
                       onChange={(e)=>this.setState({attribute: e.target.value})}/><br/>
                <button id="add-story-btn" type="submit" className="btn btn-block btn-default btn-success">Add</button>
            </form>
        );
    }
});

ReactDOM.render(
    <AttributeApp/>, document.getElementById("div-attribute-table")
);

/* Manual query */
var ManualQuery = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH,
            type: "POST",
            data: {
                attribute: this.state.attribute
            },
            success: function (response) {
                this.props.onAttributeSubmit(response);
                this.refs.attributeInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onAttributeDuplicate();
            }.bind(this)
        });
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <p><input type="text" placeholder="'Turn the temperature down by 2 degrees'" className="form-control"/>
                </p>
                <button type="submit" className="btn btn-block btn-default btn-primary">Query</button>
            </form>
        );
    }
});

ReactDOM.render(
    <ManualQuery/>, document.getElementById('div-manual-query')
);