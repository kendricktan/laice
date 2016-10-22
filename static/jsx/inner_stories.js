/**
 * Created by kendricktan on 22/10/16.
 */
var React = require("react");
var ReactDOM = require("react-dom");

var AttributeList = React.createClass({
    deleteAttribute: function (attributeName) {
        $.ajax({
            url: "/api" + URL_PATH + "attributes/" + attributeName,
            type: 'DELETE',
            success: function (response) {
                $("#tr-" + attributeName).remove();
            },
            error: function (response) {
                console.log(response);
            }
        });
    },

    render: function () {
        return (
            <tbody>
                {
                    this.props.data.attributes.map(function (attribute) {
                        var tr_id = "tr-" + attribute["attribute"];
                        return (
                            <tr id={tr_id}>
                                <th scope="row">{ attribute["attribute"] }</th>
                                <th>
                                    <button type="button" className="btn btn-danger"
                                            onClick={
                                                this.deleteAttribute.bind(this, attribute["attribute"])
                                            }>
                                        Delete
                                    </button>
                                </th>
                            </tr>
                        );
                    }.bind(this))
                }
            </tbody>
        )
    }
});

var AttributeTable = React.createClass({
    getInitialState: function () {
        return {
            data: {
                attributes: []
            }
        };
    },

    componentDidMount: function () {
        this.serverRequest = $.get("/api" + URL_PATH + "attributes/", function (attributes) {
            this.setState({data: {attributes: attributes}})
        }.bind(this));
    },

    render: function () {
        return (
            <table id="attributes-table" className="table">
                <thead>
                <tr>
                    <th>Attribute</th>
                    <th>Action</th>
                </tr>
                </thead>

                <AttributeList data={this.state.data}/>

            </table>
        )
    }
});

var AttributeAddForm = React.createClass({
    onSubmit: function (e) {
        // Prevent refresh
        e.preventDefault();

        $.ajax({
            url: "/api" + URL_PATH + "attributes/",
            type: "POST",
            data: {
                attribute: this.state.attribute
            },
            success: function (response) {
                location.reload();
            },
            error: function (response) {
                console.log(response);
            }
        });
    },

    getInitialState: function () {
        return {
            attribute: ""
        };
    },

    render: function () {
        return (
            <form onSubmit={this.onSubmit}>
                <input name="attribute" type="text" className="form-control"
                       placeholder="Attribute name (only alpha numeric characters)"
                       onChange={(e)=>this.setState({attribute: e.target.value})}/><br/>
                <button id="add-attribute-btn" type="submit" className="btn btn-block btn-default btn-success">Add
                </button>
            </form>
        )
    }
});

ReactDOM.render(
    <AttributeTable/>, document.getElementById("div-attribute-table")
);

ReactDOM.render(
    <AttributeAddForm/>, document.getElementById("div-add-attribute")
);