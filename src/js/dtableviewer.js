/*
 * Copyright (c) 2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global StyledElements, MashupPlatform */


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

        // This is required for supporting data coming from CKAN
        // TODO: support CKAN through a new input endpoint
        if (this.structure[0].field == null && this.structure[0].id != null) {
            for (var i = 0; i < this.structure.length; i++) {
                this.structure[i].field = this.structure[i].id;
            }
        }
        // END TODO

        // Create the table
        this.table = new StyledElements.ModelTable(this.structure, {id: this.structure[0].field, pageSize: 10});
        this.table.source.changeElements(this.data);
        this.table.addEventListener("click", onRowClick.bind(this));
        this.layout.getCenterContainer().appendChild(this.table);

        // Repaint the layout
        this.layout.repaint();
    };

    return DataViewer;

})();
