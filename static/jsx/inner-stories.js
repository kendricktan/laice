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
                <div className="modal fade" id="delete-story-modal" tabIndex="-1" role="dialog"
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
            url: "/api" + URL_PATH + "queries/",
            type: "POST",
            data: {
                querystring: this.state.querystring
            },
            success: function (response) {
                this.refs.querystringInput.value = "";
            }.bind(this),
            error: function (response) {
                this.props.onAttributeDuplicate();
            }.bind(this)
        });
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <p>
                    <input ref="querystringInput" type="text" placeholder="'Turn the temperature down by 2 degrees'"
                           className="form-control"
                           onChange={(e)=>this.setState({querystring: e.target.value})}/>
                </p>
                <button type="submit" className="btn btn-block btn-default btn-primary">Query</button>
            </form>
        );
    }
});

ReactDOM.render(
    <ManualQuery/>, document.getElementById('div-manual-query')
);

/* View queries */
var QueryApp = React.createClass({
    getInitialState: function () {
        return {
            queryList: [
                // querystring
                // configured
                // parsed_ner <- NER = named entity recognizer
            ],
            nextURL: "",
        }
    },

    componentDidMount: function () {
        this.serverRequest = $.get("/api" + URL_PATH + "queries/", function (response) {
            this.setState({
                queryList: response.results,
                nextURL: response.next
            })
        }.bind(this));
    },

    render: function () {
        return (
            <div>
                <QueryList queryList={this.state.queryList}/>
            </div>
        );
    }
});

var QueryList = React.createClass({
    getInitialState: function () {
        return {
            attributeList: [],
        };
    },

    componentDidMount: function () {
        $.get("/api" + URL_PATH + "attributes/", function (response) {
            this.setState({
                attributeList: response
            })
        }.bind(this));
    },

    render: function () {
        var queries = [];
        this.props.queryList.map(function (query) {
            var gylClass = query.configured ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove";
            var nerDict = query.parsed_ner ? query.parsed_ner : {};
            queries.push(
                <div className="well">
                    <h4><span className={gylClass}></span>&nbsp; {query.querystring}</h4>
                    <hr/>

                    <table className="table">
                        <thead>
                        <tr>
                            <th>Text</th>
                            <th>Attribute</th>
                            <th>Action</th>
                        </tr>
                        </thead>


                        <QueryNERList attributeList={this.state.attributeList} nerDict={nerDict}/>

                    </table>
                </div>
            );
        }.bind(this));
        return (
            <div>
                {queries}
            </div>
        )
    }
});

// Query NER List
var QueryNERList = React.createClass({
    render: function () {
        var ners = [];
        for (var key in this.props.nerDict) {
            if (this.props.nerDict.hasOwnProperty(key)) {
                var targetText = this.props.nerDict[key];
                ners.push(
                    <QueryNER targetText={targetText} targetKey={key}/>
                )
            }
        }
        return (
            <tbody>
            {ners}
            <QueryNewNER attributeList={this.props.attributeList}/>
            </tbody>
        )
    }
});

// Query Name Entity Recognizer
var QueryNER = React.createClass({
    render: function () {
        return (
            <tr>
                <td scope="row">{ this.props.targetText }</td>
                <td>{ this.props.targetKey }</td>
                <td>
                    <button type="button" className="btn btn-danger">Delete</button>
                </td>
            </tr>
        )
    }
});

// New NER
var QueryNewNER = React.createClass({
    render: function () {
        return (
            <tr>
                <th><input type="text" className="form-control" placeholder="text"/></th>
                <th>
                    <QueryAttributeSelect attributeList={this.props.attributeList}/>
                </th>
                <th>
                    <button type="button" className="btn btn-success">Add</button>
                </th>
            </tr>
        )
    }
});

// Select combo-box for queries
var QueryAttributeSelect = React.createClass({
    render: function () {
        return (
            <select className="form-control">
                {
                    this.props.attributeList.map(function (attribute) {
                        return (<option value={attribute.attribute}>{attribute.attribute}</option>)
                    }.bind(this))
                }
            </select>
        )
    }
});

ReactDOM.render(
    <QueryApp/>
    , document.getElementById("div-query-list")
);
