/*
 *     Copyright (c) 2014-2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 */

/*global StyledElements, MashupPlatform */


window.DataViewer = (function () {

    "use strict";

    /**
     * Create a new instance of class Widget.
     * @class
     */
    var DataViewer = function DataViewer() {
        this.layout = null;
        this.table = null;

        this.structure = [];        // [ {"id":"pk"} , {"id": "name"}, ...]
        this.data = [];             // [ {"id":"2", "name":"test"}, {"id":"3", "name": "test2"}, ...]

        /* Input endpoints */
        MashupPlatform.wiring.registerCallback("dataset", handlerDataSet.bind(this));

        /* Context */
        MashupPlatform.widget.context.registerCallback(function (newValues) {
            if (this.layout && ("heightInPixels" in newValues || "widthInPixels" in newValues)) {
                this.layout.repaint();
            }
        }.bind(this));
    };

    /* ==================================================================================
     *  PUBLIC METHODS
     * ================================================================================== */

    DataViewer.prototype.init = function init() {
        this.layout = new StyledElements.BorderLayout();
        this.layout.insertInto(document.body);
        createFilter.call(this);
        this.layout.repaint();
    };

    /* ==================================================================================
     *  PRIVATE METHODS
     * ================================================================================== */

    var createFilter = function createFilter() {
        var southLayoutOptions = {
            'class': 'input input-prepend input-append'
        };
        var southLayout = new StyledElements.HorizontalLayout(southLayoutOptions);

        this.layout.getSouthContainer().appendChild(southLayout);

        // Function to be call when the user clicks on "search" or types "enter"
        var filter = function filter() {
            /* jshint validthis:true */
            this.table.source.changeOptions({'keywords': textInput.getValue()});
        };

        var searchAddon = new StyledElements.Addon({'title': 'Search'});
        southLayout.getWestContainer().appendChild(searchAddon);

        // Set search icon
        var searchIcon = document.createElement('i');
        searchIcon.className = 'icon-search';
        searchAddon.appendChild(searchIcon);

        // Set input field
        var textInput = new StyledElements.StyledTextField({placeholder: 'Filter'});
        textInput.addEventListener('submit', filter.bind(this));
        southLayout.getCenterContainer().appendChild(textInput);
        searchAddon.assignInput(textInput);

        // Set search button
        var search_button = new StyledElements.StyledButton({
            text: 'Search'
        });
        search_button.addEventListener('click', filter.bind(this));
        southLayout.getEastContainer().appendChild(search_button);
    };

    var onRowClick = function onRowClick(row) {
        MashupPlatform.wiring.pushEvent('selected-row', row);
    };

    var handlerDataSet = function handlerDataSet(datasetString) {
        /*  dataset = {
         *      "structure": [ {"id": "pk", "type": "number"}, ... ],
         *      "data": [ {"pk": "", ...}, ...]
         *  }
         */

        // Remove the previuos table
        this.layout.getCenterContainer().clear();

        // Parse the dataset
        var dataset = JSON.parse(datasetString);

        // Set the data and the structure
        this.data = dataset.data;
        this.structure = dataset.structure;

        // Create the table
        this.table = new StyledElements.ModelTable(this.structure, {id: this.structure[0].field, pageSize: 10});
        this.table.source.changeElements(this.data);
        this.table.addEventListener("click", onRowClick);
        this.layout.getCenterContainer().appendChild(this.table);

        // Repaint the layout
        this.layout.repaint();
    };

    return DataViewer;

})();
