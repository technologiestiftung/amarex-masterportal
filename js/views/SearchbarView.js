define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Searchbar.html',
    'text!templates/SearchbarStreets.html',
    'text!templates/SearchbarNumbers.html',
    'models/Searchbar'
], function ($, _, Backbone, SearchbarTemplate, SearchbarStreetsTemplate, SearchbarNumbersTemplate, Searchbar) {

    var SearchbarView = Backbone.View.extend({
        model: Searchbar,
        id: 'searchbar',
        className: 'col-md-5 col-sm-4 col-xs-9',
        template: _.template(SearchbarTemplate),
        events: {
            'click button': 'checkStringForSearch', // Klick auf Lupe
            'submit form': 'checkStringForSearch', // Entertaste in der Searchbar
            'keyup input': 'checkStringForComplete',
            'click .streets': 'searchHouseNumbers',
            'click .numbers': 'setHouseNumber'
        },
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:streetNames', this.showStreetNames);
            this.listenTo(this.model, 'change:houseNumbers', this.showHouseNumbers);

            $(window).resize($.proxy(function () {
                this.render();
            }, this));
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            if (window.innerWidth < 768) {
                $('.navbar-toggle').before(this.$el); // vor dem toggleButton
            } else {
                $('.navbar-collapse').append(this.$el); // rechts in der Menuebar
            }
        },
        checkStringForSearch: function () {
            this.model.setSearchString($('#searchInput').val());
            this.model.checkSearchString('search');
        },
        checkStringForComplete: function () {
            this.model.setSearchString($('#searchInput').val());
            this.model.checkSearchString('complete');
        },
        showStreetNames: function () {
            var attr = this.model.toJSON();
            $('#autoCompleteBody').html(_.template(SearchbarStreetsTemplate, attr));
            $('#autoCompleteBody').css("display", "block");
        },
        showHouseNumbers: function () {
            var attr = this.model.toJSON();
            $('#autoCompleteBody').html(_.template(SearchbarNumbersTemplate, attr));
            $('#autoCompleteBody').css("display", "block");
        },
        searchHouseNumbers: function (evt) {
            var value = evt.target.textContent;
            $('#searchInput').val(value).focus();
            $('#autoCompleteBody').css("display", "none");
            this.checkStringForComplete();
        },
        setHouseNumber: function (evt) {
            var value = evt.target.textContent;
            $('#searchInput').val(this.model.get('streetName') + ' ' + value).focus();
            $('#autoCompleteBody').css("display", "none");
            this.checkStringForSearch();
        }
    });

    return SearchbarView;
});
