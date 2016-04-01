define([
    "backbone",
    "backbone.radio",
    "modules/treeMobile/breadCrumb/model"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        BreadCrumbItem = require("modules/treeMobile/breadCrumb/model"),
        BreadCrumbList;

    BreadCrumbList = Backbone.Collection.extend({
        model: BreadCrumbItem,

        /**
         * Registriert die Listener und fügt das erste "Breadcrumb-Item" hinzu
         */
        initialize: function () {
            var channel = Radio.channel("BreadCrumb");

            channel.on({
                "addItem": this.addItem
            }, this);

            this.listenTo(Radio.channel("MenuBar"), {
                // wird ausgeführt wenn das Menü zwischen mobiler Ansicht und Desktop wechselt
                "switchedMenu": this.checkAppView
            });

            this.listenTo(this, {
                "remove": function () {
                    Radio.trigger("TreeList", "checkIsExpanded");
                },
                "update": function (collection, options) {
                    if (_.has(options, "index")) {
                        var lastModel = collection.at(collection.length - 1);

                        Radio.trigger("TreeList", "updateList", lastModel.getId());
                    }
                }
            });

            this.addMainItem();
        },

        /**
         * Prüft die aktuelle Ansicht (desktop/mobil).
         * In der mobilen Ansicht wird das erste Breadcrumb-Item zugefügt.
         * In der desktop Ansicht werden alle Models aus der Liste entfernt.
         */
        checkAppView: function () {
            // true wenn sich das Menü in der mobilen Navigation befindet
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === true) {
                this.addMainItem();
            }
            else {
                this.reset(null);
            }
        },

        /**
         * Fügt der Liste das erste "Breadcrumb-Item" (Main-Item) hinzu.
         */
        addMainItem: function () {
            this.add({
                id: "main",
                title: "Menü"
            });
        },

        /**
         * Fügt der Liste ein neues Model hinzu
         * @param {Backbone.Model} model - Model aus der TreeList
         */
        addItem: function (model) {
            this.add({
                id: model.getId(),
                title: model.getTitle()
            });
        },

        /**
         * Löscht alle Models ab einen bestimmten Index aus der Collection
         * @param  {Backbone.Model} model - Ab diesem Model aufwärts, werden alle Models gelöscht
         */
        removeItems: function (model) {
            var modelIndex = this.indexOf(model),
                models = this.filter(function (model, index) {
                    return index > modelIndex;
                });

            this.remove(models);
        },

        /**
         * Löscht das letzte Model aus der Collection
         */
        removeLastItem: function () {
            if (this.length > 1) {
                this.pop();
            }
        }
    });

    return BreadCrumbList;
});
