/*
 *     Copyright (c) 2014-2015 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 */

/* global DataViewer */


(function () {

    "use strict";

    var data_viewer = new DataViewer();
    window.addEventListener("DOMContentLoaded", data_viewer.init.bind(data_viewer), false);

})();
